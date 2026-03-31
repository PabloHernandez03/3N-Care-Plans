import express from 'express';
import DashboardConfig from '../models/DashboardConfig.js';

const router = express.Router();

const DEFAULT_WIDGETS = [
    { key: 'tendencia',    visible: true },
    { key: 'edad',         visible: true },
    { key: 'sangre',       visible: true },
    { key: 'sexo',         visible: true },
    { key: 'edadSexo',     visible: true },
    { key: 'diagnosticos', visible: false },
    { key: 'recientes',    visible: false },
    { key: 'antecedentes', visible: false },
    { key: 'habitos',      visible: false },
    { key: 'medicamentos', visible: false },
    { key: 'reingresos',   visible: false },
    { key: 'estancia',     visible: false },
];

// GET — obtener config del enfermero (crea una por defecto si no existe)
router.get('/:enfermeroId', async (req, res) => {
    try {
        let config = await DashboardConfig.findOne({ enfermeroId: req.params.enfermeroId });

        if (!config) {
            config = await DashboardConfig.create({
                enfermeroId: req.params.enfermeroId,
                widgets: DEFAULT_WIDGETS,
            });
        } else {
            // Agregar widgets nuevos que no existan en el documento guardado
            const existingKeys = config.widgets.map(w => w.key);
            const missing = DEFAULT_WIDGETS.filter(w => !existingKeys.includes(w.key));
            if (missing.length > 0) {
                config.widgets = [...config.widgets, ...missing];
                await config.save();
            }
        }

        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo configuración' });
    }
});

// PUT — guardar config
router.put('/:enfermeroId', async (req, res) => {
    try {
        const config = await DashboardConfig.findOneAndUpdate(
            { enfermeroId: req.params.enfermeroId },
            { widgets: req.body.widgets },
            { new: true, upsert: true }
        );
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Error guardando configuración' });
    }
});
export default router;