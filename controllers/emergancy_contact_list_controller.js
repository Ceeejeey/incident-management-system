const express = require('express');
const path = require('path'); 
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/emergency-contacts-list',authenticateToken, async(req, res) => {
    const contacts = [
        {
            role: "Rector",
            address: `Rector,
                        Trincomalee Campus,
                        Eastern University, Sri Lanka,
                        Konesapuri,
                        Nilaveli-31010
                        Sri Lanka.`,
            email: "rector@esn.ac.lk",
            office: "026-2227410",
            fax: " 026-2227411",
            
        },
        {
            role: "Dean / Faculty of Applied Science",
            address: `Dean
                        Faculty of Applied Science,
                        Trincomalee Campus,
                        Eastern University, Sri Lanka,
                        Konesapuri, Nilaveli`,
            email: "rector@esn.ac.lk",
            office: "026-2227410",
            fax: " 026-2227411",
        },
        {
            role: "Dean / Faculty of Communication and Business Studies",
            address: `Dean,
                        Faculty of Communication and Business Studies,
                        Trincomalee Campus,
                        Eastern University, Sri Lanka,
                        Konesapuri,
                        Nilaveli-31010
                        Sri Lanka.`,
            email: "dean.fcbs@esn.ac.lk",
            office: "+94 26 2224011",
            fax: "0262227411",
        },
        {
            role: "Dean / Faculty of Siddha Medicine",
            address: `Dean,
                    Faculty of Siddha Medicine,
                    Trincomalee Campus,
                    Eastern University, Sri Lanka.`,
            email: "dean.fsm@esn.ac.lk",
            office: "026-2227410",
            fax: " 026-2227411",
        },
        {
            role: "Senior Assistant Registrar / Capital Works & Planning",
            address: "-",
            email: "-",
            office: "026 - 2227373",
            fax: "026-2226093"
        },
        {
            role: "Assistant Registrar /Administration",
            address: "-",
            email: "-",
            office: "026 - 2222300",
            fax: "026 - 2222300"
        },
        {
            role: "Assistant Registrar/Academic Affairs",
            address: "-",
            email: "-",
            office: "026 - 2051221",
            fax: "-"
        },
        {
            role: "Assistant Registrar / Establishment",
            address: "-",
            email: "-",
            office: "026 - 2222769",
            fax: "026 - 2222769"
        },
        {
            role: "Assistant Registrar / Welfare",
            address: "-",
            email: "-",
            office: "026 -2051221",
            fax: "-"
        },
        
    ];

    res.render('emergencyContacts/emergency_contact_list', { contacts });
});

module.exports = router;