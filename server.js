const express = require('express');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const accessToken = process.env.MP_ACCESS_TOKEN || '';
const client = new MercadoPagoConfig({ accessToken: accessToken });

app.post('/api/create-preference', async (req, res) => {
    try {
        const { title, price, type, id } = req.body;
        
        if (!accessToken) {
            return res.status(500).json({ error: "Token do Mercado Pago não configurado no servidor." });
        }

        const preference = new Preference(client);
        const host = process.env.RENDER_EXTERNAL_URL || 'https://motomolde.onrender.com';

        const result = await preference.create({
            body: {
                items: [
                    {
                        id: String(id || 'vip-anual'),
                        title: String(title || 'Produto Moto Molde'),
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
                // Adicionamos regras para garantir que os meios de pagamento estejam abertos
                payment_methods: {
                    excluded_payment_types: [],
                    installments: 1
                }
            }
        });

        res.json({ init_point: result.init_point });
    } catch (error) {
        console.error("Erro detalhado ao criar preferência MP:", error);
        res.status(500).json({ error: error.message || "Erro interno ao gerar pagamento" });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
