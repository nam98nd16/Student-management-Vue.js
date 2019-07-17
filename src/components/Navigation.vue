<template>
    <header>
        <section>
            <div class="col1">
                <router-link to="dashboard"><h3>Student Management Project</h3></router-link>
                <ul class="inline">
                    <li><router-link to="dashboard">Dashboard</router-link></li>
                    <li><router-link to="settings">Settings</router-link></li>
                    <li><a @click="logoutUsingAPI">logout</a></li>
                </ul>
            </div>
        </section>
    </header>
</template>

<script>
import axios from 'axios'
const api = axios.create({
    baseURL: 'http://localhost:3000'
})
import { Script } from 'vm';
const fb = require('../firebaseConfig.js')
    export default {
        methods: {
            logout () {
                fb.auth.signOut().then(() => {
                    this.$store.dispatch('clearData')
                    this.$router.push('/login')
                }).catch(err => {
                    console.log(err)
                })
            },
            logoutUsingAPI () {
                api.get('logout', { 'headers': { 'Authorization': this.$cookie.get('token')}}).then(res => {
                    this.$store.dispatch('clearData')
                    this.$router.push('/login')
                    this.$cookie.delete('token')
                })
            }
        }
    }
</script>