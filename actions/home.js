"use server"
import aj from "@/lib/arcjet";
import { serialized } from "@/lib/healper";
import { db } from "@/lib/pisma";
import { request } from "@arcjet/next";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";

export async function getFeaturedCars(limit = 3) {
  try {
    const { userId } = await auth();
     let user = null;
     if(userId)
     {user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });}
    
    const cars = await db.car.findMany({
      where: {
        featured: true,
        status: "AVAILABLE",
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return await Promise.all(cars.map(car => serialized(car, user)));




  } catch (error) {
    throw new Error("Error fetching featured cars: " + error.message);
  }
}

// export async function getFeaturedCars(limit = 3) {
//   try {
//     const cars = await db.car.findMany({
//       where: {
//         featured: true,
//         status: "AVAILABLE",
//       },
//       take: limit,
//       orderBy: { createdAt: "desc" },
//     });
//     return cars.map(serializedCarsData);
//   } catch (error) {
//     throw new Error("Error fetching featured cars" + error.message);
//   }
// }


async function fileToBase64(file) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    return buffer.toString("base64");
  }


export async function processImageSearch(file) {
  try {
    const req =await request();
    const decision = await aj.protect(req, { requested: 1 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });
        throw new Error("Too many request. Please try again later.");
      }
      throw new Error("Request blocked");
    }
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured");
    }




    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    



    // Convert image file to base64
    const base64Image = await fileToBase64(file);

   
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: file.type,
      },
    };

    // Define the prompt for car detail extraction
    const prompt = `
      Analyze this car image and extract the following information for a search query:
      1. Make (manufacturer)
      2. Body type (SUV, Sedan, Hatchback, etc.)
      3. Color

      Format your response as a clean JSON object with these fields:
      {
        "make": "",
        "bodyType": "",
        "color": "",
        "confidence": 0.0
      }

      For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
      Only respond with the JSON object, nothing else.
    `;
    console.log(prompt)
   
    const result = await model.generateContent([imagePart, prompt]);
    const response = await result.response;
    
    const text = response.text();
    
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
        const carDetails=JSON.parse(cleanedText)
        return{
            success:true,
            data:carDetails
        }
    } catch (error) {
        console.log("Failed to parse AI response:",error);
        return{
            success:false,
            error:"Failed to parse AI response"
        }
    }


  } catch (error) {
    throw new Error("AI search error:"+error.message)
  }
}
