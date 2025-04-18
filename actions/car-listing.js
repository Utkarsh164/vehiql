import { db } from "@/lib/pisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getCarFilters() {
  try {
    const makes = await db.car.findMany({
      where: { status: "AVAILABLE" },
      select: { make: true },
      distinct: ["make"],
      orderBy: { make: "asc" },
    });
    const bodyTypes = await db.car.findMany({
      where: { status: "AVAILABLE" },
      select: { bodyType: true },
      distinct: ["bodyType"],
      orderBy: { make: "asc" },
    });
    const fuelTypes = await db.car.findMany({
      where: { status: "AVAILABLE" },
      select: { fuelType: true },
      distinct: ["fuelType"],
      orderBy: { make: "asc" },
    });
    const transmissions = await db.car.findMany({
      where: { status: "AVAILABLE" },
      select: { transmission: true },
      distinct: ["transmission"],
      orderBy: { make: "asc" },
    });
    const priceAggregations = await db.car.aggregate({
      where: { status: "AVAILABLE" },
      _min: { price: true },
      _max: { price: true },
    });
    return {
      success: true,
      data: {
        makes: makes.map((item) => item.make),
        bodyTypes: bodyTypes.map((item) => item.bodyType),
        fuelTypes: fuelTypes.map((item) => item.fuelType),
        transmissions: transmissions.map((item) => item.transmission),
        priceRange: {
          min: priceAggregations._min.price
            ? parseFloat(priceAggregations._min.price.toString())
            : 0,
          max: priceAggregations._max.price
            ? parseFloat(priceAggregations._max.price.toString())
            : 100000,
        },
      },
    };
  } catch (error) {
    throw new Error("Error fetching car filters:" + error.message);
  }
}

export async function getCars({
  search = "",
  make = "",
  bodyType = "",
  fuelType = "",
  transmission = "",
  minPrice = 0,
  maxPrice = Number.MAX_SAFE_INTEGER,
  sortBy = "newest", // Options: newest, priceAsc, priceDesc
  page = 1,
  limit = 6,
}) {
  try {
    const { userId } = await auth();
    let dbUser = null;
    if (userId) {
      dbUser = await db.user.findUnique({
        where: { clerkUserId: userId },
      });
    }
    let where = {
      status: "AVAILABLE",
    };
    if (search) {
      where.OR = [
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (make) where.make = { equals: make, mode: "insensitive" };
    if (bodyType) where.bodyType = { equals: bodyType, mode: "insensitive" };
    if (fuelType) where.fuelType = { equals: fuelType, mode: "insensitive" };
    if (transmission)
      where.transmission = { equals: transmission, mode: "insensitive" };
    where.price = {
      gte: parseFloat(minPrice) || 0,
    };

    if (maxPrice && maxPrice < Number.MAX_SAFE_INTEGER) {
      where.price.lte = parseFloat(maxPrice);
    }

    const skip=(page-1)*limit;


    let orderBy={}
    switch(sortBy){
        case "priceAsc":
            orderBy={price:"asc"};
            break;
        case "priceDesc":
            orderBy={price:"desc"};
            break;
        case "newest":
            orderBy:{createdAt:"desc"};
            break;        
    }
    const totalCars=await db.car.count({where});
    const cars=await db.car.findMany({
        where,
        take:limit,
        skip,
        orderBy
    });
    let wishlist=new Set();
    if(dbUser){
        const saveCars=await db.userSavedCar.find({
            where:{userId:dbUser.id},
            select:{carId:true}
        })
        wishlist=new Set(saveCars.map((saved)=>saved.carId));
    }
    const serializedCars=cars.map((car)=>serializedCarData(car, wishlist.has(car.id)));

    return{
      success:true,
      data:serializedCars,
      Pagination:{
        total:totalCars,
        page,
        limit,
        pages:Math.ceil(totalCars/limit),
      }
    }
  } catch (error) {
    throw new Error("Error fetching cars:"+error.message);
  }
}
export async function toggleSavedCar(carId) {
  try {
    const {userId}=await auth();
    if(!userId) throw new Error("Unauthorized");

    const user=await db.user.findUnique({
      where:{clerkUserId:userId},
    })
    if(!user) throw new Error("User not found");

    const car = await db.car.findUnique({
      where:{id:carId}
    })
    if(!car){
      return{
        success:false,
        error:"Car not found"
      }
    }
    const existingSave=await db.userSavedCar.findUnique({
      where:{
        userId_carId:{
          userId:user.id,
          carId,
        }
      }
    })

    if(existingSave){
      await db.userSavedCar.delete({
        where:{
          userId_carId:{
            userId:user.id,
            carId,
          }
        }
      });

      revalidatePath('/saved-cars');
      return{
        success:true,
        saved:false,
        message:"Car removed from favorites"
      }
    }


    await db.userSavedCar.create({
      data:{
          userId:user.id,
          carId,
        }
    });

    revalidatePath('/saved-cars');
    return{
      success:true,
      saved:true,
      message:"Car added  to favorites"
    }



  } catch (error) {
    throw new Error("Error toggling saved car:"+error.message);
  }
  
}