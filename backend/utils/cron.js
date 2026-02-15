import Order from "../models/order.model.js";

const checkOverdueOrders = async () => {
    try {
        const thresholdTime = new Date(Date.now() - 60 * 60 * 1000);

        const overdueOrders = await Order.find({
            status: 'pending',
            payment_method: 'bank_transfer',
            createdAt: { $lt: thresholdTime }
        });

        if (overdueOrders.length > 0) {
            console.log(`Found ${overdueOrders.length} overdue orders. Cancelling...`);

            for (const order of overdueOrders) {
                order.status = 'cancelled';
                await order.save();

            }
            console.log(`Cancelled ${overdueOrders.length} orders.`);
        }
    } catch (error) {
        console.error("Error checking overdue orders:", error);
    }
};

const startCron = () => {
    // Run immediately on start
    checkOverdueOrders();

    // Run every 5 minutes
    setInterval(checkOverdueOrders, 5 * 60 * 1000);
    console.log("Order expiration cron job started.");
};

export default startCron;
