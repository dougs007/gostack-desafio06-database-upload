import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError("You don't have enough balance");
    }

    let categoryTransactions = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!categoryTransactions) {
      categoryTransactions = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(categoryTransactions);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: categoryTransactions,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
