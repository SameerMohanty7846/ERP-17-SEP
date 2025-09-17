import { sequelize } from '../models/index.js';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import path from 'path'
import fs from 'fs'
const EmployeePassword = sequelize.models.EmployeePassword;


const Employee = sequelize.models.Employee;

export const getMyProfile = async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.user.userId, {
            attributes: { exclude: ['password', 'is_master'] }
        });
        if (!employee) {
            return res.status(404).json({ message: 'User profile not found.' });
        }
        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile.', error: error.message });
    }
};




export const updateMyProfile = async (req, res) => {
    const { name, email, phone, address, removePicture } = req.body;
    try {
        const employee = await Employee.findByPk(req.user.userId);
        if (!employee) {
            return res.status(404).json({ message: 'User profile not found.' });
        }

        if (email && email !== employee.email) {
            const existing = await Employee.findOne({ 
                where: { email, id: { [Op.ne]: req.user.userId } } 
            });
            if (existing) {
                return res.status(409).json({ message: 'Email is already in use by another account.' });
            }
        }
        
        const oldPicturePath = employee.picture;

        employee.name = name || employee.name;
        employee.email = email || employee.email;
        employee.phone = phone || employee.phone;
        employee.address = address || employee.address;

        if (req.file) {
            employee.picture = req.file.path;
        } else if (removePicture === 'true') {
            employee.picture = null;
        }

        await employee.save();

        if (oldPicturePath && oldPicturePath !== employee.picture) {
            const fullPath = path.join('public', oldPicturePath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        }

        res.status(200).json({ message: 'Profile updated successfully.' });
    } catch (error) {
        console.error("Error updating profile:", error); 
        res.status(500).json({ message: 'Error updating profile.', error: error.message });
    }
};


// export const changeMyPassword = async (req, res) => {
//     //here it will check weather it is matching with the last three password
//     const { oldPassword, newPassword } = req.body;
//     if (!oldPassword || !newPassword || newPassword.length < 8) {
//         return res.status(400).json({ message: 'Both old and new passwords are required. New password must be at least 8 characters.' });
//     }
    
//     try {
//         const employee = await Employee.findByPk(req.user.userId);
//         if (!employee) {
//             return res.status(404).json({ message: 'User profile not found.' });
//         }
//         const isPasswordMatch = await bcrypt.compare(oldPassword, employee.password);
//         if (!isPasswordMatch) {
//             return res.status(401).json({ message: 'Incorrect old password.' });
//         }

//         employee.password = await bcrypt.hash(newPassword, 10);
//         await employee.save();

//         res.status(200).json({ message: 'Password changed successfully.' });
//     } catch (error) {
//         res.status(500).json({ message: 'Error changing password.', error: error.message });
//     }
// };



export const changeMyPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ message: 'Both old and new passwords are required. New password must be at least 8 characters.' });
  }

  try {
    const employee = await Employee.findByPk(req.user.userId);
    if (!employee) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    // Check if old password matches
    const isPasswordMatch = await bcrypt.compare(oldPassword, employee.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Incorrect old password.' });
    }

    // Fetch last 3 passwords from EmployeePassword history for this employee, order by created_at descending
    const lastPasswords = await EmployeePassword.findAll({
      where: { employee_id: employee.id },
      order: [['created_at', 'DESC']],
      limit: 3
    });

    // Check if new password matches any of the last 3 passwords
    for (const oldPassRecord of lastPasswords) {
      const isSameAsOld = await bcrypt.compare(newPassword, oldPassRecord.password);
      if (isSameAsOld) {
        return res.status(400).json({ message: 'New password must not be the same as any of the last 3 passwords.' });
      }
    }

    // Hash new password and save it
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    employee.password = hashedPassword;
    await employee.save();

    // Save new password to EmployeePassword history table
    await EmployeePassword.create({
      employee_id: employee.id,
      password: hashedPassword,
      created_at: new Date()
    });

    res.status(200).json({ message: 'Password changed successfully.' });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error changing password.', error: error.message });
  }
};


export const verifyPassword = async (req, res) => {
  try {
    // Get authenticated user info from middleware
    const userId =req.user.userId; // assuming JWT payload has user id here

    // Password submitted by user to verify
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required.' });
    }

    // Find employee by ID from token
    const employee = await Employee.findByPk(userId);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    if (!employee.password) {
      return res.status(400).json({ message: 'Password is not set for this employee.' });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, employee.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Password is incorrect.' });
    }

    // Password matched
    return res.json({ message: 'Password is correct.' });
  } catch (error) {
    console.error('Error verifying password:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};