const express = require('express');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do Mercado Pago utilizando a variável de ambiente do Render
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });

// Rota para criar preferência de pagamento automática no Mercado Pago
app.post('/api/create-preference', async (req, res) => {
    try {
        const { title, price, type, id } = req.body;

        const preference = new Preference(client);
        const host = req.protocol + '://' + req.get('host');

        const result = await preference.create({
            body: {
                items: [
                    {
                        id: id || 'vip-anual',
                        title: title,
                        quantity: 1,
                        unit_price: Number(price)
                    }
                ],
                back_urls: {
                    success: `${host}/?vip_success=true`,
                    failure: `${host}/`,
                    pending: `${host}/`
                },
                auto_return: 'approved',
            }
        });

        res.json({ init_point: result.init_point });
    } catch (error) {
        console.error("Erro ao criar preferência MP:", error);
        res.status(500).json({ error: error.message });
    }
});

// Servir o arquivo frontend (index.html)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
