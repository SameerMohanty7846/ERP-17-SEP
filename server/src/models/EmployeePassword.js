import { DataTypes } from 'sequelize';

export default (sequelize) => {
  sequelize.define('EmployeePassword', {
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'employee_passwords',
    timestamps: false
  });
};
