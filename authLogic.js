const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path')

class User {
    constructor({ id, firstName, lastName, gender, phoneNumber, email, image, skills, address, token, password, cv }) {
        this.id = id
        this.firstName = firstName;
        this.lastName = lastName;
        this.gender = gender;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.image = image;
        this.skills = skills;
        this.address = address;
        this.token = token;
        this.password = password;
        this.cv = cv
    }
}
class Auth {
    filePath = path.join(__dirname, 'data.json')
    async hashPassword(password) {
        const saltRounds = 9; // Number of salt rounds (higher is more secure, but slower)
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    }
    async comparePassword(password, hashedPassword) {
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    }
    async readJson(filePath) {
        let data = []
        if (fs.existsSync(filePath)) {
            const rawData = fs.readFileSync(filePath)
            data = JSON.parse(rawData);
        }
        return data
    }
    async writeJson(filePath, data) {
        const jsonData = JSON.stringify(data, null, 2);

        fs.writeFile(filePath, jsonData, (err) => {
            if (err) {
                console.error('Error writing JSON:', err);
            } else {
                console.log('JSON data written to data.json');
            }
        })
    }
    isExist(data, user) {
        return data.find((e) => e.email === user.email)
    } 
    validate(user, users) {
        const errors = {};

        // firstName
        if (!user.firstName || typeof user.firstName !== 'string' || user.firstName.trim().length < 2 || user.firstName.trim().length > 50) {
            errors.firstName = 'First name is required, must be a string, and between 2 and 50 characters.';
        }
        // lastName
        if (!user.lastName || typeof user.lastName !== 'string' || user.lastName.trim().length < 2 || user.lastName.trim().length > 50) {
            errors.lastName = 'Last name is required, must be a string, and between 2 and 50 characters.';
        }

        // gender
        if (!user.gender || !['Male', 'Female', 'Other'].includes(user.gender)) {
            errors.gender = 'Gender is required and must be one of: Male, Female, Other.';
        }

        // phoneNumber (basic check - consider a more robust library for phone number validation)
        if (user.phoneNumber && (typeof user.phoneNumber !== 'string' || user.phoneNumber.trim().length < 10)) {
            errors.phoneNumber = 'Phone number must be a string and at least 10 digits.';
        }

        // email
        if (user.email && !/\S+@\S+\.\S+/.test(user.email)) {
            errors.email = 'Invalid email format.';
        } else if (this.isExist(users, user)) {
            errors.email = 'Email is already exist';
        }
        //username
        if (!user.username) {
            errors.username = 'Username is required.';
        } else if (user.username.length < 5 || user.username.length > 20) {
            errors.username = 'Username must be between 5 and 20 characters long.';
        } else if (!/^[a-zA-Z0-9._]+$/.test(user.username)) {
            errors.username = 'Username can only contain alphanumeric characters, periods (.), and underscores (_).';
        }

        // image (basic check)
        if (user.image && typeof user.image !== 'string') {
            errors.image = 'Image must be a string (likely a path or URL).';
        }

        // skills (assuming it's an array of strings)
        if (user.skills && (!Array.isArray(user.skills) || !user.skills.every(skill => typeof skill === 'string' && skill.trim() !== ''))) {
            errors.skills = 'Skills must be an array of non-empty strings.';
        }

        // address (assuming it's an object - add more specific validation as needed)
        if (user.address && typeof user.address !== 'object') {
            errors.address = 'Address must be an object.';
        } else if (user.address && typeof user.address === 'object') {
            if (!user.address.street || typeof user.address.street !== 'string' || user.address.street.trim() === '') {
                errors.address = errors.address ? errors.address + ', Street is required.' : 'Street is required.';
            }
            if (!user.address.city || typeof user.address.city !== 'string' || user.address.city.trim() === '') {
                errors.address = errors.address ? errors.address + ', City is required.' : 'City is required.';
            }
        }
        const commonWeakPasswords = [
            'password', '123456', 'qwerty', '12345678', 'password123', '111111', '123123', '000000',
            'abcdefg', '1234567', 'letmein', 'password1', 'iloveyou'
        ];

        if (user.password) {
            if (user.password.length < 8) {
                errors.password = 'Password must be at least 8 characters long.';
            } else if (!/[a-z]/.test(user.password)) {
                errors.password = errors.password ? errors.password + ', Password must contain at least one lowercase letter.' : 'Password must contain at least one lowercase letter.';
            } else if (!/[A-Z]/.test(user.password)) {
                errors.password = errors.password ? errors.password + ', Password must contain at least one uppercase letter.' : 'Password must contain at least one uppercase letter.';
            } else if (!/[0-9]/.test(user.password)) {
                errors.password = errors.password ? errors.password + ', Password must contain at least one number.' : 'Password must contain at least one number.';
            } else if (!/[^a-zA-Z0-9]/.test(user.password)) {
                errors.password = errors.password ? errors.password + ', Password must contain at least one special character.' : 'Password must contain at least one special character.';
            } else if (commonWeakPasswords.includes(user.password.toLowerCase())) {
                errors.password = errors.password ? errors.password + ', Password is too common.' : 'Password is too common.';
            }
        } else {
            errors.password = 'Password is required.';
        }

        return errors;
    }
    secretKey = 'swe'; // Get the secret key from environment variables

    generateToken(user) {
        const payload = {
            userId: user.id, // Or a unique user identifier
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber
        };

        const options = {
            expiresIn: '1h', // Token expiration time (adjust as needed)
        };

        try {
            const token = jwt.sign(payload, this.secretKey, options);
            return token;
        } catch (error) {
            console.error('Error generating token:', error);
            return null; // Or throw the error, depending on your error handling strategy
        }
    }
    async register(user) {
        const users = await this.readJson(this.filePath)
        const validation = this.validate(user, users)
        if (Object.keys(validation).length > 0) {
            return { ok: false, validation: validation }
        }
        const password = await this.hashPassword(user.password)
        const token = this.generateToken(user)
        users.push(new User({ ...user, id: users.length + 1, token: token, password: password }))
        this.writeJson(this.filePath, users)
        return { ok: true }
    }
    async login({ email, password }) {
        const users = await this.readJson(this.filePath)
        console.log(password)
        console.log(email)
        for (let i = 0; i < users.length; i++) {
            const e = users[i]
            const passwordMatch = await this.comparePassword(password, e.password);
            if (e.email === email && passwordMatch) {
                console.log('matched')
                return { ok: true, user: { password, ...e } }
            }
        }
        return { ok: false, message: 'email or password isn\'t correct ' }
    }
}
module.exports = Auth 
 