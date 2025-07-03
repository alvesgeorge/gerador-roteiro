import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const HF_TOKEN = process.env.HF_TOKEN;
const HF_MODEL = "mistralai/mistral-7b-instruct";
const HF_API_URL = "https://router.huggingface.co/novita/v3/openai/chat/completions";

app.post('/api/gerar-roteiro', async (req, res) => {
  const { destino, dataInicio, dataFim, perfil, preferencias, orcamento, restricoes } = req.body;

  const prompt = `
Você é um especialista em turismo. Crie um roteiro turístico em formato JSON para:

Destino: ${destino}
Período: de ${dataInicio} até ${dataFim}
Perfil dos viajantes: ${perfil}
Preferências: ${preferencias}
Orçamento: ${orcamento}
Restrições: ${restricoes}

Responda apenas em JSON bem estruturado com datas, atividades por dia e sugestões locais.
  `;

  try {
    const resposta = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [
          { role: "system", content: "Você é um assistente especialista em turismo." },
          { role: "user", content: prompt }
        ],
        stream: false
      })
    });

    const json = await resposta.json();

    if (!json.choices || !json.choices[0]?.message?.content) {
      return res.status(500).json({ erro: 'Erro na resposta da IA', detalhe: json });
    }

    const respostaTexto = json.choices[0].message.content;

    try {
      const parsed = JSON.parse(respostaTexto);
      res.json(parsed);
    } catch (e) {
      // IA não respondeu com JSON válido
      res.json({ aviso: "Resposta não foi JSON válido", texto_bruto: respostaTexto });
    }

  } catch (err) {
    console.error("Erro ao chamar IA:", err);
    res.status(500).json({ erro: "Erro ao gerar roteiro", detalhe: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
