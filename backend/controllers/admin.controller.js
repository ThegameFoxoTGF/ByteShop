import asyncHandler from "../middleware/asynchandler.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    // 1. Total Sales (Revenue) - from paid/completed orders
    // Condition: 
    // - If non-COD: status in [paid, processing, shipped, completed]
    // - If COD: status MUST be 'completed'
    const salesCondition = {
        $or: [
            {
                payment_method: { $ne: 'cod' },
                status: { $in: ['paid', 'processing', 'shipped', 'completed'] }
            },
            {
                payment_method: 'cod',
                status: 'completed'
            }
        ]
    };

    const salesResult = await Order.aggregate([
        { $match: salesCondition },
        {
            $group: {
                _id: null, // Group all matches together
                totalSales: { $sum: "$pricing_info.total_price" }
            }
        }
    ]);
    const totalSales = salesResult[0]?.totalSales || 0;

    // 2. Total Orders
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    // 3. Total Users
    const totalUsers = await User.countDocuments();
    const newUsersLast30Days = await User.countDocuments({
        createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
    });

    // 4. Total Products
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({ stock: { $lte: 10 } });

    // 5. Recent Orders
    const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user_id', 'id email profile');

    // 6. Sales Chart Data (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0); // Start from beginning of the day

    const salesChart = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: sevenDaysAgo },
                ...salesCondition
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt",
                        timezone: "+07:00"
                    }
                },
                total: { $sum: "$pricing_info.total_price" }
            }
        },
        { $sort: { _id: 1 } }
    ]);


    res.json({
        totalSales,
        totalOrders,
        pendingOrders,
        totalUsers,
        newUsersLast30Days,
        totalProducts,
        lowStockProducts,
        recentOrders,
        salesChart
    });
});

export {
    getDashboardStats
};
