'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/solid';
import { createCompany, getCompany } from '@/services/api';
import debounce from 'lodash/debounce';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type FormData = {
  name: string;
  handle: string;
  description: string;
};

type Field = {
  name: keyof FormData;
  label: string;
  type: string;
  validate: (value: string) => Promise<string | null>;
};

const fields: Field[] = [
  {
    name: 'name',
    label: 'Company Name',
    type: 'text',
    validate: async (value) =>
      value.length < 2 ? 'Company name is required' : null
  },
  {
    name: 'handle',
    label: 'Company Handle',
    type: 'text',
    validate: async (value) =>
      value.length < 3
        ? 'Company handle must be at least 3 characters'
        : (await getCompany(value)) === null
          ? null
          : 'Company handle already exists'
  },
  {
    name: 'description',
    label: 'Company Description',
    type: 'text',
    validate: async (value) =>
      value.length < 10
        ? 'Company description must be at least 10 characters'
        : null
  }
];

export default function CompanyRegistration() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    handle: '',
    description: ''
  });
  const [currentField, setCurrentField] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isWelcomePage, setIsWelcomePage] = useState(true);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    setIsLoading(true);
    await debouncedValidateField(name as keyof FormData, value);
    setIsLoading(false);
  };

  const validateField = async (fieldName: keyof FormData, value: string) => {
    const field = fields.find((f) => f.name === fieldName);
    if (field) {
      const error = await field.validate(value);
      setErrors((prev) => ({ ...prev, [fieldName]: error }));
    }
  };

  const debouncedValidateField = useCallback(debounce(validateField, 3000), []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      nextField();
    }
  };

  const nextField = () => {
    if (
      currentField < fields.length - 1 &&
      !errors[fields[currentField].name]
    ) {
      setCurrentField((prev) => prev + 1);
    } else if (currentField === fields.length - 1) {
      handleSubmit();
    }
  };

  const prevField = () => setCurrentField((prev) => Math.max(prev - 1, 0));

  const isFieldValid = (fieldName: keyof FormData) =>
    !errors[fieldName] && formData[fieldName] !== '';

  const { mutate, isPending, isError, error, isSuccess } = useMutation({
    mutationFn: createCompany
  });

  const handleSubmit = async () => {
    if (
      Object.values(errors).every((error) => error === null) &&
      Object.values(formData).every((value) => value !== '')
    ) {
      mutate(formData);
    }
  };

  const handleStartRegistration = () => {
    setIsWelcomePage(false);
  };

  if (isSuccess) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
            Registration submitted!
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Your startup registration has been submitted to the Company House.
            <br className="hidden sm:inline" />
            To get it registered, proceed to confirm your identity.
          </p>
          <Button variant="default" className="mt-6">
            <Link href="/user" passHref className="flex items-center">
              Go to Profile <ChevronRightIcon className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      <AnimatePresence initial={false}>
        {isWelcomePage ? (
          <motion.div
            key="welcome"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
            <div className="text-center p-8 max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Incorporate your Startup
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 space-y-4">
                <span className="block">
                  TSC is the fastest way to start your company 100% online. We
                  help you incorporate, open a bank account and charge your
                  first customers.
                </span>
                <span className="block">
                  Tell us about your startup and cofounders, and TSC will form
                  your startup in Sark (UK), get your tax number and file all
                  the required paperwork.
                </span>
                <span className="block">Get up and running in 5 minutes.</span>
              </p>
              <Button onClick={handleStartRegistration} size="lg">
                Start Registration
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="registration"
            className="absolute inset-0"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex h-screen w-full bg-white dark:bg-gray-900">
              <div className="flex w-full">
                <div className="grid w-full grid-cols-1 lg:grid-cols-2">
                  {/* Form Section */}
                  <div className="flex items-center justify-center bg-gray-50 p-8 dark:bg-gray-800">
                    <div className="relative h-full w-full max-w-lg ">
                      <div className="mb-8 pt-16">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                          Company Registration
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                          Fill in the details to register your company
                        </p>
                      </div>
                      <div className="mb-8">
                        <div className="flex justify-between space-x-2">
                          {fields.map((field, index) => (
                            <div key={field.name} className="flex-1">
                              <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                <motion.div
                                  className="h-full bg-indigo-600"
                                  initial={{ width: '0%' }}
                                  animate={{
                                    width: index <= currentField ? '100%' : '0%'
                                  }}
                                  transition={{
                                    duration: 0.5,
                                    ease: 'easeInOut'
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-6">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentField}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            transition={{ duration: 0.3 }}
                          >
                            <label
                              htmlFor={fields[currentField].name}
                              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                            >
                              {fields[currentField].label}
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <input
                                type={fields[currentField].type}
                                name={fields[currentField].name}
                                id={fields[currentField].name}
                                value={formData[fields[currentField].name]}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className={`block w-full px-4 py-3 rounded-md border-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-offset-2 focus:outline-none transition duration-150 ease-in-out ${
                                  errors[fields[currentField].name]
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500'
                                }`}
                                placeholder={`Enter ${fields[currentField].label.toLowerCase()}`}
                              />
                              {isLoading ? (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900"></div>
                                </div>
                              ) : (
                                isFieldValid(fields[currentField].name) && (
                                  <CheckCircleIcon className="h-6 w-6 text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                                )
                              )}
                            </div>
                            {errors[fields[currentField].name] && (
                              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                {errors[fields[currentField].name]}
                              </p>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                      <div className="mt-8 flex justify-between">
                        <button
                          onClick={prevField}
                          disabled={currentField === 0}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-indigo-300 dark:hover:bg-gray-600 transition duration-150 ease-in-out"
                        >
                          <ChevronUpIcon className="mr-2 h-5 w-5" />
                          Previous
                        </button>
                        <button
                          onClick={nextField}
                          disabled={
                            currentField === fields.length - 1 && isPending
                          }
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition duration-150 ease-in-out"
                        >
                          {currentField === fields.length - 1 ? (
                            isPending ? (
                              'Submitting...'
                            ) : (
                              'Submit'
                            )
                          ) : (
                            <>
                              Next
                              <ChevronDownIcon className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Preview Section */}
                  <div className="flex items-center justify-center bg-white p-8 dark:bg-gray-900">
                    <div className="w-full max-w-lg">
                      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                        Registration Summary
                      </h2>
                      <div className="space-y-4">
                        <AnimatePresence>
                          {Object.entries(formData).map(
                            ([key, value]) =>
                              value && (
                                <motion.div
                                  key={key}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                  transition={{ duration: 0.3 }}
                                  className="rounded-md border border-gray-200 p-4 dark:border-gray-700"
                                >
                                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {key
                                      .replace(/([A-Z])/g, ' $1')
                                      .replace(/^./, (str) =>
                                        str.toUpperCase()
                                      )}
                                  </p>
                                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                                    {key === 'handle' ? `@${value}` : value}
                                  </p>
                                </motion.div>
                              )
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
