import { useState } from "react";

interface Customer {
  id: number;
  name: string;
  phone: string;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  // This would be replaced with an actual API call
  const mockCustomers: Customer[] = [
    { id: 1, name: "Acme Corporation", phone: "555-123-4567" },
    { id: 2, name: "Johnson & Associates", phone: "555-987-6543" },
    { id: 3, name: "Smith Family Trust", phone: "555-456-7890" },
  ];

  // Simulating data fetching on component mount
  useState(() => {
    setCustomers(mockCustomers);
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <button className="btn btn-primary">Add Customer</button>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>{customer.name}</td>
                <td>{customer.phone}</td>
                <td>
                  <button className="btn btn-sm btn-ghost">View</button>
                  <button className="btn btn-sm btn-ghost">Edit</button>
                  <button className="btn btn-sm btn-error">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;
