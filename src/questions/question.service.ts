import { Injectable } from "@nestjs/common";
import {FirebaseApp, initializeApp} from "firebase/app"
import {Firestore, collection, doc, getDoc, getDocs, getFirestore} from "firebase/firestore"
import { QuestionCategory } from "src/game/game.interface";

export abstract class QuestionService{
    abstract getAllQuestions(): Promise<string[]>;
    abstract getQuestions(category: string): Promise<string[]>;
    abstract getCategories(): Promise<QuestionCategory[]>;
}

@Injectable()
export class FirestoreQuestionService implements QuestionService{

    private readonly firebase: any
    private readonly firestore: Firestore
    constructor() {
        const firebaseConfig = {
            apiKey: "AIzaSyAG2z22gVLVAaznt712mc2z5xzxXFgpE9w",
            authDomain: "who-game-fba18.firebaseapp.com",
            projectId: "who-game-fba18",
            storageBucket: "who-game-fba18.appspot.com",
            messagingSenderId: "451235408281",
            appId: "1:451235408281:web:7f6b033098cb938f1dcb08"
          };

        this.firebase = initializeApp(firebaseConfig)     
        this.firestore = getFirestore(this.firebase)
    }

    async getAllQuestions(): Promise<string[]> {
        // read all documents from questions collections and concatenate their questions attribute
        const querySnapshot = await getDocs(collection(this.firestore, "questions"))
        const questions: string[] = []
        querySnapshot.forEach(doc => {
            questions.push(...doc.data().questions)
        })

        return questions
    }

    async getQuestions(category: string): Promise<string[]> {
        //read the document that have the category as id and return its questions attribute
        const docRef = doc(this.firestore, "questions", category)
        const docSnap = await getDoc(docRef)
        return docSnap.data().questions
    }

    async getCategories(): Promise<QuestionCategory[]> {
        // read all documents from questions collections and return their ids
        const docs = await  getDocs(collection(this.firestore, "questions"))
        const categories: QuestionCategory[] = []
        docs.forEach(doc => {
            const data = doc.data()
            categories.push({key: doc.id, category: data.name, iconUrl: data.iconUrl})
        })

        return categories
    }
    
}