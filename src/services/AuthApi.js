import Api from './Api'

export default {
    signupUsingAPI (name, username, password) {
        Api().post('register', {name, username, password})
    },
    loginUsingAPI (username, password) {
        return Api().post('login', {username, password})
    }
}