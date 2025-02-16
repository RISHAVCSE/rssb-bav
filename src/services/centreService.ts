
const API_URL=process.env.REACT_APP_API_URL;

export class CentreService {

    public static async fetchAllCentre (): Promise<any>{

        try{
            const response=await  fetch(API_URL+'centres/getAllCentres');
            if(!response.ok){
                throw new Error('Failed to Fetch Books');
                
            }
            const data: any=await response.json();
            return data;


        } catch(error){
            throw error;

        }

    }

}