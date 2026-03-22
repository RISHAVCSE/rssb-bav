import keycloak from "../KeyCloak/KeyCloak";
const API_URL=process.env.REACT_APP_API_URL;

const authHeader = () => ({
  Authorization: `Bearer ${keycloak.token}`,
});
export class CentreService {

    public static async fetchAllCentre (): Promise<any>{

        try{
            const response=await  fetch(API_URL+'centres/getAllCentres',
                {
                    headers: {
                        ...authHeader(),

                    },
                });
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