const jwt = require("../utils/jwt");

const asureAuth = (req, res, next) => {
    if (!require.headers.authorization) {
        return res.status(403).
        send({ msg: "La petición no tiene cabecera de autenticación." });
    }
    const token = req.headers.authorization.replace("Bearer ", "");
    try{
        const payload = jwt.decoded(token);
        const { exp } = payload;
        const currentDate = new Date().getTime();
        if (exp <= currentDate){
            return res.status(404).send({ msg: "El token ha expirado." });
        }
        req.user = payload;
        next();
    } catch (error) {
        return res.status(404).send({ msg: "Token inválido." });
    }
};

module.exports = {
    asureAuth,
}