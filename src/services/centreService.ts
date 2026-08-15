import keycloak from "../KeyCloak/KeyCloak";
import { API_BASE_URL } from "./api";

const authHeader = () => ({
  Authorization: `Bearer ${keycloak.token}`,
});
export class CentreService {

    public static async fetchAllCentre (): Promise<any>{

        try{
            const response=await  fetch(`${API_BASE_URL}/centres/getAllCentres`,
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