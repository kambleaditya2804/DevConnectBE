import mongoose from "mongoose";
const paymentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        },
        paymentId: {
            type: String,
            //oder can be without payment id in case of failed payment
        },
        orderId: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            
        },
        currency: {
            type: String,
            
        },
        receipt: {
            type: String,
            
        }
        ,
        notes: {
            firstName: { type: String },
            lastName: { type: String },
            membershipType: { type: String }
        },
        isPremium: {
            type: Boolean,
            default: false
        },
        membershipType:{
            type: String,
        }

    }, {
    timestamps: true
}
);
const Payment = new mongoose.model("Payment", paymentSchema);
export default Payment;