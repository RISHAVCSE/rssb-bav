export class AllotedBookService {
    public static async getBookBasedUponCentre (mmsId: string): Promise<any>{

        try{
            const response=await fetch(`http://localhost:8080/api/centre-book/getBookBasedUponCentre?mmsId=`+mmsId);
            if(!response.ok){
                throw new Error('Failed to fetch Records');
            }
            const data: any=await response.json();
            return data;

        }catch(error){
            console.error('Error fetching books',error);
            throw error;
        }
    }

    public static async addBookBasedUponCentre (newCentre: any): Promise<any>{

            const response=await fetch(`http://localhost:8080/api/centre-book/allocateBooktoCentre`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newCentre),
            });
            const data: any=await response.json();

            if(response.ok){
                return data;                
            }
          
            throw new Error(data.error || `HTTP error! status: ${response.status}`);


       

    }

    public static async getAllBookBasedUponCentre (centreCode: any): Promise<any>{

        try{
            const response=await fetch(`http://localhost:8080/api/centre-book/getAllBookBasedUponCentre?centreCode=`+centreCode);
            if(!response.ok){
                throw new Error('Failed to fetch Records');
            }
            const data: any=await response.json();
            return data;

        }catch(error){
            console.error('Error fetching books',error);
            throw error;
        }
    }

    public static async getAllAllocationData (): Promise<any>{

        try{
            const response=await fetch(`http://localhost:8080/api/allocation/all`);
            if(!response.ok){
                throw new Error('Failed to fetch Records');
            }
            const data: any=await response.json();
            return data;

        }catch(error){
            console.error('Error fetching books',error);
            throw error;
        }
    }
    public static async allocateOrChangeCenterData (newCentre: any): Promise<any>{
        try{
            const response=await fetch(`http://localhost:8080/api/centre-book/allocateOrChangeCenterData`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newCentre),
            });
            if(!response.ok){
                throw new Error('Failed to add this');
            }
            const data: any=await response.json();
            return data;


        } catch(error){
            throw error;
        }

    }

    public static async salesData (payLoad: any): Promise<any>{
        try{
            const response=await fetch(`http://localhost:8080/api/allocation/add`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payLoad),
            });
            if(!response.ok){
                throw new Error('Failed to add this');
            }
            const data: any=await response.json();
            return data;


        } catch(error){
            throw error;
        }

    }

}