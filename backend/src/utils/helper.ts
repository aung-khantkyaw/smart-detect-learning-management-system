import jwt from "jsonwebtoken";

const generateToken = (userId: string): string => {
	const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your_jwt_secret', {
		expiresIn: '7d',
	});
	return token;
};

export default generateToken;
