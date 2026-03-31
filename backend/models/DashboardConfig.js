import mongoose from 'mongoose';

const dashboardConfigSchema = new mongoose.Schema({
    enfermeroId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Enfermero',
        required: true,
        unique: true
    },
    widgets: [{
        key:     { type: String, required: true },
        visible: { type: Boolean, default: true },
    }]
}, { timestamps: true });

export default mongoose.model('DashboardConfig', dashboardConfigSchema, 'dashboardconfigs');