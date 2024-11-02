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
    public static async addBook(newBook: Book): Promise<Book> {
        try {
          const response = await fetch(`http://localhost:8080/api/books/addbooks`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newBook),
          });
          if (!response.ok) {
            throw new Error('Failed to add book');
          }
          const data: Book = await response.json();
          return data;
        } catch (error) {
          console.error('Error adding book', error);
          throw error;
        }
      }

      public static async update(newBook: any,bookid: any): Promise<Book> {
        try {
          const response = await fetch(`http://localhost:8080/api/books/updateBook/`+bookid, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newBook),
          });
          if (!response.ok) {
            throw new Error('Failed to add book');
          }
          const data: Book = await response.json();
          return data;
        } catch (error) {
          console.error('Error adding book', error);
          throw error;
        }
      }


}