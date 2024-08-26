import { Book } from "../interfaces";

const API_URL=process.env.REACT_APP_API_URL;
export class BooksService{
    public static async fetchAllBooks(): Promise<Book[]>{
        try{
            const response= await fetch('http://localhost:8080/api/books/allbooks');
            if(!response.ok){
                throw new Error('Failed to fetch books');
            }
            const data: Book[]=await response.json();
            return data;
        } catch(error){
            console.error('Error fetching books',error);
            throw error;
        }

    }
}