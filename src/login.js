import { login } from './auth.js'

const form = document.getElementById('loginForm')
const btn = document.getElementById('loginBtn')
const errorEl = document.getElementById('errorMessage')

form?.addEventListener('submit', (e) => {
  e.preventDefault()
  errorEl.style.display = 'none'
  btn.disabled = true
  login()
  window.location.href = '/'
})
