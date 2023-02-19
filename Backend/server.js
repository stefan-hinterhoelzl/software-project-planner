import { initializeApp } from 'firebase-admin';
import * as dotenv from 'dotenv'
import express from 'express'



dotenv.config()

initializeApp({
    credential: admin.credential.cert({
        private_key: 
            process.env.FIREBASE_API_KEY,
        projectId: process.env.FIREBASE_PROJECT_ID
    }),
});



