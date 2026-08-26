import { Problem, IProblem } from '../models/Problem';

export class ProblemRepository {
  async findAll(filter: any = {}): Promise<IProblem[]> {
    return Problem.find(filter).sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<IProblem | null> {
    return Problem.findById(id);
  }

  async findBySlug(slug: string): Promise<IProblem | null> {
    return Problem.findOne({ slug });
  }

  async create(data: Partial<IProblem>): Promise<IProblem> {
    const problem = new Problem(data);
    return problem.save();
  }

  async insertMany(data: Partial<IProblem>[]): Promise<IProblem[]> {
    return Problem.insertMany(data) as unknown as IProblem[];
  }

  async update(id: string, data: Partial<IProblem>): Promise<IProblem | null> {
    return Problem.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await Problem.findByIdAndDelete(id);
    return !!result;
  }
}
