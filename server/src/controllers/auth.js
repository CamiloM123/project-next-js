const bcrypt = require('bcryptjs');
const User = require('../models/user');

const jwt = require('../utils/jwt'); 



// Funcion que permite el registro de un usuario nuevo en el sistema
const register = async (req, res) => {
    const { firstname, lastname, email, password } = req.body;
    if (!email) return res.status(400).send({ msg: 'El email es obligatorio.' });
    if (!password) return res.status(400).send({ msg: 'La contraseña es obligatoria.' });

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);

    const user = new User({
        firstname,
        lastname,
        email: email.toLowerCase(),
        password: hashPassword,
        role: 'user',
        active: true,
        password: hashPassword,
    });

    try {
        const userStorage = await user.save();
        res.status(201).send(userStorage);
    } catch (error) {
        res.status(400).send({msg : "Error al crear el usuario."});
    }
};

/* Función que permite iniciar sesión */

const login = async (req, res) => {
    const { email, password } = req.body;
    try{
        if (!email || !password ){
            throw new Error('El email y la contraseña son obligatorios.');
        }
        const emailLowerCase = email.toLowerCase();
        const userStore = await User.findOne({ email: emailLowerCase }).exec();
        if (!userStore){
            throw new Error('El usuario no existe.');
        }
        const check = await bcrypt.compare(password, userStore.password);
        if (!check){
            throw new Error('La contraseña es incorrecta.');
        }
        if (!userStore.active){
            throw new Error('El usuario no está activo o no está autorizado.');
        }
        res.status(200).send({
            access: jwt.createAccessToken(userStore), 
            refresh: jwt.createRefreshToken(userStore),
        });
    } catch (error){
        res.status(400).send({ msg: error.message });
    }
};

async function refreshAccessToken(req, res) {
    try {
        const { token } = req.body;
        if (!token){
            return res.status(400).send({ msg: 'El token es obligatorio.' });
        }
        const { user_id } = jwt.decoded(token);
        // Buscar al usuario usando una promesa
        const userStorage = await User.findOne({ _id: user_id });
        // Generar un nuevo token de acceso
        const accessToken = jwt.createAccessToken(userStorage);
        // Enviar respueta
        return res.status(200).send({ accessToken });   
    } catch (error){
        return res.status(500).send({ msg : "Error del servidor" });
    }
};

module.exports = {
    register,
    login,
    refreshAccessToken,
};