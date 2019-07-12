<template>
    <div id="login">
        <transition name="fade">
            <div v-if="performingRequest" class="loading">
                <p>Loading...</p>
            </div>
        </transition>
        <section>
            <div class="col1">
                <h1>Student Management Project</h1>
            </div>
            <div class="col2" :class="{'signup-form': !showLoginForm}">
                <form v-if="showLoginForm" @submit.prevent>
                    <h1>Welcome Back</h1>

                    <label for="username1">Email</label>
                    <input v-model.trim="loginForm.email" type="text" placeholder="Enter username" id="username1" />

                    <label for="password1">Password</label>
                    <input v-model.trim="loginForm.password" type="password" placeholder="******" id="password1" />

                    <button @click="login" class="button">Log In</button>

                    <div class="extras">
                        <a @click="toggleForm">Create an Account</a>
                    </div>
                </form>
                <form v-if='!showLoginForm' @submit.prevent>
                    <h1>Get Started</h1>

                    <label for="name2">Email</label>
                    <input v-model.trim="signupForm.email" type="text" placeholder="Enter name" id="name2" />

                    <label for="username">username</label>
                    <input v-model.trim="signupForm.name" type="text" placeholder="Enter username" id="username" />

                    <label for="password">password</label>
                    <input v-model.trim="signupForm.password" type="password" placeholder="Enter password" id="password" />

                    <label for="title">Title</label>
                    <input v-model.trim="signupForm.title" type="text" placeholder="Company" id="title" />

                    <button @click="signup" type="submit" class="button">Sign Up</button>

                    <div class="extras">
                        <a @click="toggleForm">Back to Log In</a>
                    </div>
                </form>
                <transition name="fade">
                    <div v-if="errorMsg !== ''" class="error-msg">
                        <p>{{ errorMsg }}</p>
                    </div>
                </transition>
            </div>
        </section>
    </div>
</template>


<script>
import AuthApi from '@/services/AuthApi'
const fb = require('../firebaseConfig.js')
    export default {
        data() {
            return {
                loginForm: {
                    email: '',
                    password: ''
                },
                signupForm: {
                    name: '',
                    title: '',
                    email: '',
                    password: ''
                },
                signupAPIForm: {
                    name: '',
                    username: '',
                    password: ''
                },
                loginAPIForm: {
                    username: '',
                    password: ''
                },
                showLoginForm: true,
                performingRequest: false,
                errorMsg: '',
                checkLogin: false
            }
        },
        methods: {
            toggleForm () {
                this.showLoginForm = !this.showLoginForm
                this.errorMsg = ''
            },
            login () {
                this.performingRequest = true
                fb.auth.signInWithEmailAndPassword(this.loginForm.email, this.loginForm.password).then(user => {
                    this.$store.commit('setCurrentUser', user.user)
                    this.$store.dispatch('fetchUserProfile')
                    this.performingRequest = false
                    this.$router.push('/dashboard')
                }).catch(err => {
                    console.log(err)
                    this.performingRequest = false
                    this.errorMsg = err.message
                })
            },
            signup () {
                this.performingRequest = true
                fb.auth.createUserWithEmailAndPassword(this.signupForm.email, this.signupForm.password).then(user => {
                    this.$store.commit('setCurrentUser', user.user)
                    fb.usersCollection.doc(user.user.uid).set({
                        name: this.signupForm.name,
                        title: this.signupForm.title,
                        uid: user.user.uid
                    }).then(() => {
                        this.$store.dispatch('fetchUserProfile')
                        this.performingRequest = false
                        this.$router.push('/dashboard')
                    }).catch(err => {
                        console.log(err)
                        this.performingRequest = false
                        this.errorMsg = err.message
                    })
                }).catch(err => {
                    console.log(err)
                    this.performingRequest = false
                    this.errorMsg = err.message
                })
            },
            async signupWithAPI () {
                this.performingRequest = true
                AuthApi.signupUsingAPI(this.signupAPIForm.name, this.signupAPIForm.username, this.signupAPIForm.password)
                this.performingRequest = false
            },
            async loginWithAPI () {
                //this.performingRequest = true
                const response = await AuthApi.loginUsingAPI(this.loginAPIForm.username, this.loginAPIForm.password)
                if (response.data.username) {
                    this.$store.commit('setCurrentUser', response.data)
                    this.$store.dispatch('fetchUserProfile')
                    this.performingRequest = false
                    this.$router.push('/test')
                }
                this.performingRequest = false
            }
        }
    }
</script>