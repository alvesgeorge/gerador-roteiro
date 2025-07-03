// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/gerar-roteiro", async (req, res) => {
  const { destino, dataInicio, dataFim, perfil, preferencias, orcamento, restricoes } = req.body;

  const prompt = `
Você é um assistente especializado em roteiros turísticos. Gere um roteiro em formato JSON com o seguinte schema:

{
  "itinerario": [
    {
      "dia": 1,
      "actividades": [
        {
          "horario": "string",
          "local": "string",
          "descrição": "string",
          "custo_aproximado": "string",
          "transporte": "string",
          "duração": "string",
          "foto_url": "string"
        }
      ]
    }
  ]
}

Informações da viagem:
Destino: ${destino}
Datas: ${dataInicio} a ${dataFim}
Perfil dos viajantes: ${perfil}
Preferências: ${preferencias}
Orçamento: ${orcamento}
Restrições: ${restricoes}

Responda SOMENTE com o JSON no formato especificado.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Você cria roteiros turísticos personalizados." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    });

    const jsonResponse = completion.choices[0].message.content;
    res.status(200).json(JSON.parse(jsonResponse));
  } catch (error) {
    console.error("Erro:", error.message);
    res.status(500).json({ error: "Erro ao gerar roteiro" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
