import { GoogleGenerativeAI } from "@google/generative-ai"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/superbase";
import { cookies } from "next/headers";

async function fileToBase64(file) {
    const bytes=await file.arrayBuffer() 
    const buffer=Buffer.from(bytes);
    return buffer.toString("base64")
    
}
export async function processCarImageWithAI(file) {
    try{
        if(!process.env.GEMINI_API_KEY){
            throw new Error("Gemini API key is not configured")
        }
        const genAI=new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model=genAI.getGenerativeModel({model:"gemini-1.5-flash"});
        const base64Image=await fileToBase64(file) 
        const imagePart={
            inlineData:{
                data:base64Image,
                mimeType:file.type,
            }
        }
        const prompt = `
      Analyze this car image and extract the following information:
      1. Make (manufacturer)
      2. Model
      3. Year (approximately)
      4. Color
      5. Body type (SUV, Sedan, Hatchback, etc.)
      6. Mileage
      7. Fuel type (your best guess)
      8. Transmission type (your best guess)
      9. Price (your best guess)
      9. Short Description as to be added to a car listing

      Format your response as a clean JSON object with these fields:
      {
        "make": "",
        "model": "",
        "year": 0000,
        "color": "",
        "price": "",
        "mileage": "",
        "bodyType": "",
        "fuelType": "",
        "transmission": "",
        "description": "",
        "confidence": 0.0
      }

      For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
      Only respond with the JSON object, nothing else.
    `;
    const result=await model.generateContent([imagePart,prompt]);
    const response=await result.response;
    const text=response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    try{
        const carDetails = JSON.parse(cleanedText);

      // Validate the response format
      const requiredFields = [
        "make",
        "model",
        "year",
        "color",
        "bodyType",
        "price",
        "mileage",
        "fuelType",
        "transmission",
        "description",
        "confidence",
      ];
      const missingFields = requiredFields.filter(
        (field) => !(field in carDetails)
      );
      if(missingFields.length>0){
        throw new Error(`AI response missing required fields: ${missingFields.join(", ")}`)
      }
      return{
        success:true,
        data:carDetails
      }
    }
    catch(error){
        console.error("Failed to parse AI  response:",parseError);
        return{
            success:false,
            error:"Failed to parse AI response"
        }
    }
}
    catch(error){
        throw new Error("Gemini API error"+error.message)
    }
}

export async function addCars({carData,images}){
  try{
    const {userId}=await auth();
    if(!userId) throw new Error("unauthorized");

    const user=await db.user.findUnique({
      where:{clerkUserId: userId}
    })
    if(!user) throw new Error("user not found");

    const carId=uuidv4();
    const folderPath=`cars/${carId}`;
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const imageUrls=[];
    for(let i=0;i<images.length;i++)
    {
      const base64data=images[i];
      if(!base64data || base64data.startsWith("data:images/")){
        console.warn("skipping invalid image data");
        continue
      }
    }
  }
  catch(error){

  }
}
