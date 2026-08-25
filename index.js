const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const axios = require("axios");

// 1. إعداد بيانات الإضافة (مع إضافة catalogs كـ array فارغة لتفادي الخطأ)
const builder = new addonBuilder({
    id: "one.bingr.addon",
    version: "1.0.0",
    name: "Bingr Stream",
    description: "Stream movies and series directly from Bingr.one",
    resources: ["stream"],
    types: ["movie", "series"],
    idPrefixes: ["tt"],
    catalogs: [] // هذا السطر يحل مشكلة الـ Build
});

builder.defineStreamHandler(async (args) => {
    const { type, id } = args;

    try {
        const response = await axios.get(`https://bingr.one/api/get-stream`, {
            params: { type, imdb: id },
            timeout: 5000
        });

        if (response.data && Array.isArray(response.data.servers)) {
            const streams = response.data.servers.map(server => ({
                name: `Bingr | ${server.name}`,
                title: `${server.resolution} - ${server.quality}`,
                url: server.directUrl
            }));

            return { streams };
        }
    } catch (error) {
        console.error("Error fetching streams from Bingr API:", error.message);
    }

    return { streams: [] };
});

const PORT = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: PORT });
