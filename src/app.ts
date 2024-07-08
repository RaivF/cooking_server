const express = require('express'),
	cors = require('cors'),
	app = express(),
	jwt = require('jsonwebtoken'),
	users = require('./users'),
	recipesList = require('./recipes') // Импортируем рецепты

const host = '127.0.0.1'
const port = 7000

const tokenKey = '1a2b-3c4d-5e6f-7g8h'

app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
	if (req.headers.authorization) {
		jwt.verify(
			req.headers.authorization.split(' ')[1],
			tokenKey,
			(err, payload) => {
				if (err) next()
				else if (payload) {
					for (const user of users) {
						if (user.id === payload.id) {
							req.user = user
							next()
						}
					}

					if (!req.user) next()
				}
			}
		)
	} else {
		next()
	}
})

app.post('/api/auth', (req, res) => {
	for (const user of users) {
		if (req.body.login === user.login && req.body.password === user.password) {
			return res.status(200).json({
				id: user.id,
				login: user.login,
				token: jwt.sign({ id: user.id }, tokenKey),
			})
		}
	}

	return res.status(404).json({ message: 'User not found' })
})

app.get('/user', ({ user: { password, ...user } }, res) => {
	if (user) return res.status(200).json(user)
	else return res.status(401).json({ message: 'Not authorized' })
})

app.get('/recipes', (req, res) => {
	return res.status(200).json(recipesList)
})

app.listen(port, host, () =>
	console.log(`Server listens http://${host}:${port}`)
)
