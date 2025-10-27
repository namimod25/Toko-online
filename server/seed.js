import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.heroSlide.createMany({
    data: [
      {
        title: "Latest Technology",
        description: "Discover the newest gadgets and devices from top brands",
        image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        buttonText: "Shop Now",
        buttonLink: "/products",
        active: true,
        order: 1
      },
      {
        title: "Amazing Deals",
        description: "Get the best prices on premium products with exclusive discounts",
        image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        buttonText: "View Deals",
        buttonLink: "/products",
        active: true,
        order: 2
      }
    ]
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })