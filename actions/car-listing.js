import { db } from "@/lib/pisma";
import { auth } from "@clerk/nextjs/server";

export async function getCarFilters() {
  try {
    const makes = await db.car.findMany({
      where: { status: "AVAILABLE" },
      select: { make: true },
      distinct: ["make"],
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
      select: { transmition: true },
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
    wishlist=new Set();
    if(dbUser){
        const saveCars=await db.userSavedCar.find({
            where:{userId:dbUser.id},
            select:{carId:true}
        })
        wishlist=new Set(saveCars.map((saved)=>saved.carId));
    }


  } catch (error) {}
}
