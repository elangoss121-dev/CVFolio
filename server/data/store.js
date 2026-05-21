import { randomUUID } from 'crypto';

const users = [];
const resumes = [];
const portfolios = [];

function now() {
  return new Date();
}

function createRecord(collection, data) {
  const record = {
    _id: data._id || randomUUID(),
    createdAt: now(),
    updatedAt: now(),
    ...data,
  };
  collection.push(record);
  return record;
}

function findById(collection, id) {
  return collection.find((item) => item._id === id) || null;
}

function updateRecord(collection, id, data) {
  const index = collection.findIndex((item) => item._id === id);
  if (index === -1) return null;
  collection[index] = {
    ...collection[index],
    ...data,
    _id: collection[index]._id,
    updatedAt: now(),
  };
  return collection[index];
}

function deleteRecord(collection, id) {
  const index = collection.findIndex((item) => item._id === id);
  if (index === -1) return null;
  return collection.splice(index, 1)[0];
}

export function createUser(data) {
  return createRecord(users, data);
}

export function findUserById(id) {
  return findById(users, id);
}

export function findUserByEmail(email) {
  return users.find((user) => user.email === email) || null;
}

export function updateUser(id, data) {
  return updateRecord(users, id, data);
}

export function deleteUser(id) {
  return deleteRecord(users, id);
}

export function createResume(data) {
  return createRecord(resumes, data);
}

export function findResumesByUserId(userId) {
  return resumes.filter((resume) => resume.userId === userId);
}

export function findResumeById(id) {
  return findById(resumes, id);
}

export function updateResume(id, data) {
  return updateRecord(resumes, id, data);
}

export function deleteResume(id) {
  return deleteRecord(resumes, id);
}

export function createPortfolio(data) {
  return createRecord(portfolios, data);
}

export function findPortfolioByUserId(userId) {
  return portfolios.find((portfolio) => portfolio.userId === userId) || null;
}

export function findPortfolioBySlug(slug, publishedOnly = true) {
  const portfolio = portfolios.find((item) => item.slug === slug);
  if (!portfolio) return null;
  if (publishedOnly && !portfolio.isPublished) return null;
  return portfolio;
}

export function updatePortfolio(id, data) {
  return updateRecord(portfolios, id, data);
}

export function deletePortfolio(id) {
  return deleteRecord(portfolios, id);
}

export function populateUser(record) {
  if (!record || !record.userId) return record;
  const user = findById(users, record.userId);
  return { ...record, userId: user || record.userId };
}
