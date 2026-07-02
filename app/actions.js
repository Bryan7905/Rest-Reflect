'use server';

import prisma from '@/lib/prisma.js';
import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { encrypt, decrypt } from '@/lib/auth.js';
import bcrypt from 'bcrypt';

// Retrieve session user Helper
async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sanctuary_session')?.value;
  if (!sessionToken) return null;
  const decoded = await decrypt(sessionToken);
  if (!decoded || !decoded.userId) return null;
  return decoded;
}

export async function loginAction(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid email address.' };
  }
  if (!password) {
    return { error: 'Please enter your password.' };
  }

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { email }
    });
  } catch (dbError) {
    return { error: 'Database connection failed. Please try again later.' };
  }

  if (!user) {
    return { error: 'No account found with this email. Please register first.' };
  }

  // Verify password hash
  if (!user.password) {
    return { error: 'This account does not have a password set. Please register again.' };
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return { error: 'Incorrect password. Please try again.' };
  }

  // Create encrypted session token
  const token = await encrypt({ userId: user.id, email: user.email });

  // Set session cookie
  const cookieStore = await cookies();
  cookieStore.set('sanctuary_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/'
  });

  redirect('/');
}

export async function registerAction(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid email address.' };
  }
  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }

  // Check if user already exists
  let existingUser;
  try {
    existingUser = await prisma.user.findUnique({
      where: { email }
    });
  } catch (dbError) {
    return { error: 'Database connection failed. Please try again.' };
  }

  if (existingUser) {
    // If they were seeded but don't have a password set, let them define their password now
    if (!existingUser.password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      });

      const token = await encrypt({ userId: updatedUser.id, email: updatedUser.email });
      const cookieStore = await cookies();
      cookieStore.set('sanctuary_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      });
      redirect('/');
    }

    return { error: 'An account with this email already exists. Try logging in.' };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword
    }
  });

  // Log user in automatically
  const token = await encrypt({ userId: user.id, email: user.email });
  const cookieStore = await cookies();
  cookieStore.set('sanctuary_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/'
  });

  redirect('/');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('sanctuary_session');
  redirect('/login');
}

export async function saveJournalEntry(formData) {
  const session = await getSessionUser();
  if (!session) {
    redirect('/login');
  }

  const content = formData.get('content');
  const physicalEnergy = parseInt(formData.get('physicalEnergy') || '3');
  const mentalEnergy = parseInt(formData.get('mentalEnergy') || '3');
  const promptUsed = formData.get('promptUsed') || '';

  if (!content) {
    throw new Error('Journal content cannot be empty.');
  }

  await prisma.entry.create({
    data: {
      userId: session.userId,
      content,
      physicalEnergy,
      mentalEnergy,
      promptUsed: promptUsed || null
    }
  });

  redirect('/');
}

export async function saveQuote(formData) {
  const session = await getSessionUser();
  if (!session) {
    redirect('/login');
  }

  const bookTitle = formData.get('bookTitle');
  const author = formData.get('author') || 'Joena San Diego';
  const quoteText = formData.get('quoteText');
  const personalNote = formData.get('personalNote') || '';
  const isPrivate = formData.get('isPrivate') === 'true';

  if (!bookTitle || !quoteText) {
    throw new Error('Book title and quote text are required.');
  }

  await prisma.quote.create({
    data: {
      userId: session.userId,
      bookTitle,
      author,
      quoteText,
      personalNote: personalNote || null,
      isPrivate
    }
  });

  redirect('/bookshelf');
}

export async function deleteQuote(formData) {
  const session = await getSessionUser();
  if (!session) {
    redirect('/login');
  }

  const quoteId = formData.get('quoteId');
  if (!quoteId) {
    throw new Error('Quote ID is required to perform deletion.');
  }

  // Double check authorization: make sure the quote belongs to this user OR is public and deleted by admin
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId }
  });

  if (!quote) {
    throw new Error('Quote not found.');
  }

  // Fetch session user's role to verify admin status
  const user = await prisma.user.findUnique({
    where: { id: session.userId }
  });

  const isAuthor = quote.userId === session.userId;
  const isAdmin = user && user.role === 'admin';
  const isPublic = !quote.isPrivate;

  // Authorize if session user is the author OR if they are an admin and the quote is public
  if (!isAuthor && !(isAdmin && isPublic)) {
    throw new Error('You are not authorized to delete this quote.');
  }

  await prisma.quote.delete({
    where: { id: quoteId }
  });

  const headersList = await headers();
  const referrer = headersList.get('referer') || '/bookshelf';
  redirect(referrer);
}
