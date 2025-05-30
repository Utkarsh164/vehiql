import { db } from "./pisma";

export const serialized = async (car, user) => {
  if (!user) {
    return {
      ...car,
      price: car.price ? parseFloat(car.price.toString()) : 0,
      createdAt: car.createdAt?.toISOString(),
      updatedAt: car.updatedAt?.toISOString(),
      wishlisted: false,
    };
  }

  const savedCars = await db.userSavedCar.findMany({
    where: { userId: user.id, carId: car.id },
    orderBy: { savedAt: "desc" },
  });

  return {
    ...car,
    price: car.price ? parseFloat(car.price.toString()) : 0,
    createdAt: car.createdAt?.toISOString(),
    updatedAt: car.updatedAt?.toISOString(),
    wishlisted: savedCars.length > 0,
  };
};



export const serializedCarsData=(car,wishlisted=false)=>{
    return{
        ...car,
        price: car.price?parseFloat(car.price.toString()):0,
        createdAt:car.createdAt?.toISOString(),
        updatedAt:car.updatedAt?.toISOString(),
        wishlisted:wishlisted,
    }
}
export const formatCurrency=(amount)=>{
    return new Intl.NumberFormat("en-US",{
        style: "currency",
        currency:"USD",
    }).format(amount);
}