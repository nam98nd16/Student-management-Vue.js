<template>
    <div id="dashboard">
        <section>
            <div class="col1">
                <div class="class">
                    <h5>Current Admin: {{ userProfile.name }}</h5>
                    <p>Admin description: {{ userProfile.title }}</p>
                    <a @click="viewAllStudents">View list of all students</a>
                    <br><br><br><br><br><br><br>
                    <div class="create-class">
                        <p>Create a new class</p>
                        <form @submit.prevent>
                            <input v-model.trim="cla.name" type="text" placeholder="Enter name of the class" id="class1" />
                            <button @click="createClass" :disabled="cla.name == ''" class="button">Create</button>
                        </form>
                    </div>
                </div>
            </div>
            <div class="col2">
                <div v-if="classes.length">
                    <div v-for="cla in classes" :key="cla.id" class="class">
                        <p>Class {{ cla.name }}</p>
                        <span>Created on: {{ cla.createdOn | formatDate}}</span>
                        <ul>
                            <li><a @click="openStudentModal(cla)">Add Student</a></li>
                            <li><a @click="viewClass(cla)">View Student List</a></li>
                        </ul>
                        <br><br><br><br>
                    </div>
                </div>
                <div v-else>
                    <p class="no-results">There are currently no classes</p>
                </div>
            </div>
        </section>
        <transition name="fade">
            <div v-if="showStudentModal" class="c-modal">
                <div class="c-container">
                    <a @click="closeStudentModal">X</a>
                    <p>Add a student to the class</p>
                    <form @submit.prevent>
                        <input v-model.trim="student.sid" type="text" placeholder="Enter the id" />
                        <button @click="addStudent" :disabled="student.sid == ''" class="button">Add</button>
                    </form>
                </div>
            </div>
        </transition>
        <transition name="fade">
            <div v-if="showClassModal" class="p-modal">
                <div class="p-container">
                    <a @click="closeClassModal" class="close">X</a>
                    <div class="post">
                        <a>There are no students in this class</a>
                    </div>
                </div>
                <div v-show="fullClass.students.length" class="p-container">
                    <a @click="closeClassModal" class="close">X</a>
                    <div class="post">
                        <a v-if="Object.keys(fullClass.students).length > 1">Total: {{Object.keys(fullClass.students).length}} students</a>
                        <a v-else>Total: {{Object.keys(fullClass.students).length}} student</a>
                    </div>
                    <div v-for="student in fullClass.students" :key="student.sid" class="comment">
                        <p>Name: {{ student.name }}</p>
                        <p>Class ID: {{ fullClass.id }}</p>
                        <p>Student ID: {{ student.uid }}</p>
                    </div>
                </div>
            </div>
        </transition>
        <!-- all students modal -->
        <transition name="fade">
            <div v-if="showAllStudentsModal" class="p-modal">
                <div class="p-container">
                    <a @click="closeAllStudentsModal" class="close">X</a>
                    <div class="post">
                        <a v-if="Object.keys(allStudents).length > 1">There are {{Object.keys(allStudents).length}} students in total</a>
                        <a v-else>Only {{Object.keys(allStudents).length}} student</a>
                    </div>
                    <div v-show="allStudents.length" class="comments">
                        <div v-for="student in allStudents" :key="student.id" class="comment">
                            <p>Name: {{ student.name }}</p>
                            <p>Student ID: {{ student.sid }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
    import moment from 'moment'
    import { mapState } from 'vuex'
    import { log } from 'util';
    const fb = require('../firebaseConfig.js')
    import * as firebase from 'firebase';
    export default {
        data () {
            return {
                cla: {
                    name: ''
                },
                student: {
                    cid: '',
                    sid: '',
                    name: '',
                    cstudents: 0
                },
                showStudentModal: false,
                showClassModal: false,
                showAllStudentsModal: false,
                fullClass: {},
                studentsInClass: [],
                allStudents: []
            }
        },
        computed: {
            ...mapState(['userProfile', 'currentUser', 'classes'])
        },
        methods: {
            createClass () {
                fb.classesCollection.add({
                    createdOn: new Date(),
                    name: this.cla.name,
                    countStudent: 0,
                    students: []
                }).then(ref => {
                    this.cla.name = ''
                }).catch(err => {
                    console.log(err)
                })
            },
            openStudentModal (cla) {
                this.student.cid = cla.id
                this.student.cstudents = cla.countStudent
                this.showStudentModal = true
            },
            closeStudentModal () {
                this.student.cid = ''
                this.student.name = ''
                this.showStudentModal = false
            },
            addStudent () {
                let cid = this.student.cid
                let cstudents = this.student.cstudents
                var studentRef = fb.studentsCollection.where('sid', '==', this.student.sid)
                var exsited
                var refID
                var getStudent = studentRef.get().then(docs => {
                    if (docs.empty) {
                        exsited = false
                    }else {
                        exsited = true
                        refID = docs.docs[0].id
                    }
                }).catch(err => {
                    console.log('Error getting document', err)
                })
                var getUser = fb.usersCollection.where('uid', '==', this.student.sid).get().then(docs => {
                    if (docs.empty) {
                        console.log("No user with that id")
                    }else if (exsited) {
                            fb.studentsCollection.doc(refID).set({
                            name: docs.docs[0].get('name'),
                            cid: cid,
                            sid: docs.docs[0].get('uid')
                        }).then(doc => {
                            fb.classesCollection.doc(cid).update({
                                students: firebase.firestore.FieldValue.arrayUnion(docs.docs[0].data()),
                                countStudent: cstudents + 1
                            }).then(() => {
                                this.closeStudentModal()
                            })
                        }).catch(err => {
                            console.log(err)
                        })
                    }else {
                        fb.studentsCollection.add({
                            name: docs.docs[0].get('name'),
                            cid: cid,
                            sid: docs.docs[0].get('uid')
                        }).then(doc => {
                            fb.classesCollection.doc(cid).update({
                                students: firebase.firestore.FieldValue.arrayUnion(docs.docs[0].data()),
                                countStudent: cstudents + 1
                            }).then(() => {
                                this.closeStudentModal()
                            })
                        }).catch(err => {
                            console.log(err)
                        })
                    }
                })
            },
            viewClass (cla) {
                fb.classesCollection.where('name', '==', cla.name).get().then(docs => {
                    let studentsArray = []
                    Array.from(docs.docs[0]).forEach(element => {
                        let stu = element.data()
                        studentsArray.push(stu)
                    })

                    this.studentsInClass = studentsArray
                    this.fullClass = cla
                    this.showClassModal = true
                })
            },
            closeClassModal () {
                this.studentsInClass = []
                this.showClassModal = false
            },
            viewAllStudents () {
                fb.studentsCollection.get().then(docs => {
                    let sArray = []

                    docs.forEach(doc => {
                        let stu = doc.data()
                        stu.id = doc.id
                        sArray.push(stu)
                    })

                    this.allStudents = sArray
                    this.showAllStudentsModal = true
                }).catch(err => {
                    console.log(err)
                })
            },
            closeAllStudentsModal () {
                this.allStudents = []
                this.showAllStudentsModal = false
            },
            testGet() {
                var docRef = fb.usersCollection.doc("CbQFcawEEPVsbi8v0QCS8dJKn1K3")
                docRef.get().then(function(doc) {
                    if (doc.exists) {
                        console.log("Document data: ", doc.data())
                    }else {
                        console.log("No such document!");
                    }
                }).catch(function(err) {
                    console.log("Error getting document: ", error);
                })
            }
        },
        filters: {
            formatDate (val) {
                if (!val) {
                    return 'Unknown date'
                }
                let date = val.toDate()
                return date
            }
        }
    }
</script>