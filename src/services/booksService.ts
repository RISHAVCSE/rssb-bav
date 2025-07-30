import { Book } from "../interfaces";

const API_URL=process.env.REACT_APP_API_URL;
export class BooksService{
    public static async fetchAllBooks(): Promise<Book[]>{
        try{
            const response= await fetch('http://localhost:8080/api/books/booksData');
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
    public static async addBook(newBook: Book): Promise<{ book: Book, message: string }> {
      const response = await fetch(`http://localhost:8080/api/books/addbooks`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(newBook),
      });
  
      const responseData = await response.json();
  
      if (response.ok) {
          return {
              book: responseData.book,
              message: responseData.message || "Book added successfully"
          };
      }
  
      throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
  }

      public static async update(newBook: any,bookid: any): Promise<{ book: Book, message: string }> {
      
          const response = await fetch(`http://localhost:8080/api/books/updateBook/`+bookid, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newBook),
          });
          const responseData = await response.json();

          if (response.ok) {
           return {
             book: responseData.book,
              message: responseData.message || "Book added successfully"

           }
          }
         
          throw new Error(responseData.message || `HTTP error! status: ${response.status}`);

       
      }


}