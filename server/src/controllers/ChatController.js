import { models } from '../models/index.js';
import { Op, Sequelize } from 'sequelize';

const { Message, Employee } = models;

// Get a list of all conversations for the logged-in user
export const getConversations = async (req, res) => {
    const userId = req.user.userId; // Assuming you have user ID from auth middleware
    try {
        const messages = await Message.findAll({
            where: { [Op.or]: [{ sender_id: userId }, { receiver_id: userId }] },
            order: [['created_at', 'DESC']],
            raw: true,
        });

        const conversations = {};
        for (const msg of messages) {
            const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
            if (!conversations[otherUserId]) {
                conversations[otherUserId] = {
                    lastMessage: msg,
                    unreadCount: 0,
                };
            }
            if (!msg.is_read && msg.receiver_id === userId) {
                conversations[otherUserId].unreadCount++;
            }
        }
        
        // Enhance with user details
        const userIds = Object.keys(conversations);
        const users = await Employee.findAll({ where: { id: userIds }, attributes: ['id', 'name', 'picture'] });
        
        const finalConversations = users.map(user => ({
            ...conversations[user.id],
            partner: user,
        }));

        res.status(200).json(finalConversations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching conversations', error: error.message });
    }
};

// Get all messages between the logged-in user and another user
export const getMessagesWithUser = async (req, res) => {
    const userId = req.user.userId;
    const partnerId = parseInt(req.params.partnerId, 10);
    try {
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { sender_id: userId, receiver_id: partnerId },
                    { sender_id: partnerId, receiver_id: userId }
                ]
            },
            order: [['created_at', 'ASC']]
        });
        
        // Mark messages as read
        await Message.update({ is_read: true }, { where: { sender_id: partnerId, receiver_id: userId } });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
};


export const searchEmployeesForChat = async (req, res) => {
    const search_query = req.query.q || '';
    const current_user_id = req.user.userId; // Get logged-in user's ID from auth middleware

    try {
        const users = await Employee.findAll({
            where: {
                // Find users whose name is LIKE the search query
                name: {
                    [Op.like]: `%${search_query}%`
                },
                // Crucially, exclude the current user from the results
                id: {
                    [Op.ne]: current_user_id
                }
            },
            attributes: ['id', 'name', 'picture'], // Only send necessary data
            limit: 10 // Limit results for performance
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error searching for users.", error: error.message });
    }
};