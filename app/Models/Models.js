const proposalSchema = new mongoose.Schema({
  title: String,
  content: String,
  status: String,
});


const jobPlanSchema = new mongoose.Schema({
  steps: [String],
});

const estimatedHoursSchema = new mongoose.Schema({
  hours: Number,
});

const clientSummarySchema = new mongoose.Schema({
  summary: String,
});
