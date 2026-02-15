// api/water.js
export default async function handler(req, res) {
    // หัวจดหมายปลอมตัว
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.thaiwater.net/",
        "Origin": "https://www.thaiwater.net",
        "Accept": "application/json, text/plain, */*"
    };

    const urlInburi = "https://api-v3.thaiwater.net/api/v1/thaiwater30/public/waterlevel?province_code=17";
    const urlDam = "https://api-v3.thaiwater.net/api/v1/thaiwater30/public/waterlevel?province_code=18";

    try {
        const [resInburi, resDam] = await Promise.all([
            fetch(urlInburi, { headers }),
            fetch(urlDam, { headers })
        ]);

        const dataInburi = await resInburi.json();
        const dataDam = await resDam.json();

        // หาอินทร์บุรี
        let inburiLevel = null;
        if (dataInburi && dataInburi.data) {
            const station = dataInburi.data.find(d => 
                (d.station && d.station.tele_station_name.th.includes("อินทร์บุรี")) ||
                (d.geocode && d.geocode.tumbon_name.th.includes("อินทร์บุรี"))
            );
            if (station) inburiLevel = parseFloat(station.waterlevel_msl);
        }

        // หาเขื่อนเจ้าพระยา
        let damDischarge = null;
        if (dataDam && dataDam.data) {
            const dam = dataDam.data.find(d => d.station && d.station.tele_station_oldcode === "C.13");
            if (dam) damDischarge = parseFloat(dam.discharge);
        }

        res.status(200).json({
            success: true,
            inburi: inburiLevel,
            dam: damDischarge
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
