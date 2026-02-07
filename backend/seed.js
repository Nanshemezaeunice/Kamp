const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Project = require('./models/Project');

dotenv.config();

const projects = [
  {
    name: "Moroto Solar Water Pump Initiative",
    ngos: ["Water4Life Uganda", "Green Uganda"],
    categories: ["Water & Sanitation", "Energy"],
    districts: ["Moroto"],
    targetAudience: ["All Communities"],
    status: "Ongoing",
    startDate: "2025-06-01",
    endDate: "2026-06-01",
    goal: 75000,
    raised: 45000,
    donors: 128,
    budgetBreakdown: "Solar Panels: 30%, Pumps: 40%, Labor: 20%, Training: 10%",
    ngoRoles: "Water4Life handles technical installation; Green Uganda manages community training.",
    description: "Installation of 10 high-capacity solar-powered water pumps across rural Moroto to ensure year-round access to clean water for pastoralist communities.",
    milestones: "Phase 1: Site Selection (Done), Phase 2: Procurement (Done), Phase 3: Installation (In Progress)",
    impactGoals: "Provide clean water to 5,000 households and reduce water-borne diseases by 40%.",
    isPublic: true,
    isOpenForDonations: true,
    isOpenForOrganizations: true,
    complianceAgreed: true,
    image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    imageType: "link"
  },
  {
    name: "Kaabong Literacy & School Feeding",
    ngos: ["FeedKaramoja", "SunlightEd"],
    categories: ["Education", "Food & Nutrition"],
    districts: ["Kaabong", "Karenga"],
    targetAudience: ["Kids"],
    status: "Active",
    startDate: "2026-01-15",
    endDate: "2026-12-15",
    goal: 50000,
    raised: 15000,
    donors: 64,
    budgetBreakdown: "Food Supplies: 50%, Books/Materials: 30%, Staff: 20%",
    description: "Combining education with nutrition to keep children in school. This project provides daily hot meals and learning materials to 5 primary schools.",
    milestones: "Initial rollout in 2 schools completed.",
    impactGoals: "Increase school attendance by 25% and improve nutritional health of 1,200 students.",
    isPublic: true,
    isOpenForDonations: true,
    isOpenForOrganizations: false,
    complianceAgreed: true,
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    imageType: "link"
  },
  {
    name: "Kotido Women's Economic Empowerment",
    ngos: ["SheFuture Foundation", "Skills4K"],
    categories: ["Gender & Development", "Economic Development"],
    districts: ["Kotido"],
    targetAudience: ["Women"],
    status: "Planned",
    startDate: "2026-03-01",
    endDate: "2026-09-01",
    goal: 30000,
    raised: 0,
    donors: 0,
    budgetBreakdown: "Grants: 60%, Training: 30%, Admin: 10%",
    description: "A vocational training program focusing on tailoring and sustainable agriculture for widow-led households in Kotido.",
    milestones: "Curriculum development finalized.",
    impactGoals: "Empower 200 women with trade skills and provide startup micro-grants.",
    isPublic: true,
    isOpenForDonations: true,
    isOpenForOrganizations: true,
    complianceAgreed: true,
    image: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    imageType: "link"
  },
  {
    name: "Abim Reforestation Project",
    ngos: ["Green Uganda"],
    categories: ["Environment"],
    districts: ["Abim"],
    targetAudience: ["All Communities"],
    status: "Ongoing",
    startDate: "2025-04-10",
    endDate: "2027-04-10",
    goal: 120000,
    raised: 80000,
    donors: 210,
    budgetBreakdown: "Seedlings: 20%, Labor: 60%, Monitoring: 20%",
    description: "Restoring 500 hectares of degraded forest land in Abim to combat desertification and provide sustainable timber and fruit resources.",
    milestones: "100,000 trees planted so far.",
    impactGoals: "Carbon sequestration and restoring local biodiversity.",
    isPublic: true,
    isOpenForDonations: true,
    isOpenForOrganizations: true,
    complianceAgreed: true,
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    imageType: "link"
  },
  {
    name: "Nakapiripirit Mobile Health Clinic",
    ngos: ["HealthReach Uganda"],
    categories: ["Health"],
    districts: ["Nakapiripirit", "Nabilatuk"],
    targetAudience: ["All Communities", "Elderly"],
    status: "Active",
    startDate: "2025-11-01",
    endDate: "2026-11-01",
    goal: 90000,
    raised: 35000,
    donors: 92,
    budgetBreakdown: "Vehicle Maintenance: 20%, Medicine: 50%, Staff: 30%",
    description: "A mobile clinic van that visits remote villages weekly to provide vaccinations, maternal care, and emergency first aid.",
    milestones: "Second mobile unit acquired.",
    impactGoals: "Reduce maternal mortality and provide healthcare access to 10,000 people in hard-to-reach areas.",
    isPublic: true,
    isOpenForDonations: true,
    isOpenForOrganizations: true,
    complianceAgreed: true,
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    imageType: "link"
  },
  {
    name: "Napak Livestock Vaccination Drive",
    ngos: ["AgroAid Karamoja"],
    categories: ["Agriculture"],
    districts: ["Napak"],
    targetAudience: ["All Communities"],
    status: "Planned",
    startDate: "2026-04-01",
    endDate: "2026-06-01",
    goal: 25000,
    raised: 5000,
    donors: 12,
    budgetBreakdown: "Vaccines: 70%, Vet Staff: 20%, Logistics: 10%",
    description: "Critical vaccination drive for cattle and goats to prevent East Coast Fever and PGP outbreaks among pastoralist herds.",
    milestones: "Cold chain logistics secured.",
    impactGoals: "Protect 50,000 head of livestock from preventable diseases.",
    isPublic: true,
    isOpenForDonations: true,
    isOpenForOrganizations: true,
    complianceAgreed: true,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    imageType: "link"
  },
  {
    name: "Amudat Ghee Processing Plant",
    ngos: ["ActionAid Karamoja", "Skills4K"],
    categories: ["Agriculture", "Economic Development"],
    districts: ["Amudat"],
    targetAudience: ["Women"],
    status: "Ongoing",
    startDate: "2025-08-15",
    endDate: "2026-08-15",
    goal: 150000,
    raised: 150000,
    donors: 0,
    budgetBreakdown: "Construction: 40%, Machinery: 40%, Training: 20%",
    description: "Setting up a modern ghee processing factory to help women pastoralists add value to their milk products and access urban markets.",
    milestones: "Structure complete; installing machinery.",
    impactGoals: "Increase household income for 400 women by 300%.",
    isPublic: true,
    isOpenForDonations: false,
    isOpenForOrganizations: true,
    complianceAgreed: true,
    image: "https://images.unsplash.com/photo-1528484461644-4217abc8879a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    imageType: "link"
  },
  {
    name: "Karamoja Regional Digital Hub",
    ngos: ["SunlightEd"],
    categories: ["Education", "Economic Development"],
    districts: ["Moroto"],
    targetAudience: ["Kids", "All Communities"],
    status: "Active",
    startDate: "2026-02-01",
    endDate: "2027-02-01",
    goal: 60000,
    raised: 20000,
    donors: 45,
    budgetBreakdown: "Laptops: 50%, Internet: 20%, Instructors: 30%",
    description: "Providing computer literacy and coding classes to youth. The hub also serves as a co-working space for local entrepreneurs.",
    milestones: "Curriculum launch; first batch of 50 students enrolled.",
    impactGoals: "Train 500 youth in digital skills within the first year.",
    isPublic: true,
    isOpenForDonations: true,
    isOpenForOrganizations: false,
    complianceAgreed: true,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    imageType: "link"
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");
    
    await Project.deleteMany({});
    console.log("Cleared existing projects.");
    
    await Project.insertMany(projects);
    console.log("Successfully seeded projects!");
    
    process.exit();
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seedDB();
