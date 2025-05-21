import { useState } from "react";

interface Matter {
  id: number;
  title: string;
  description: string;
  customerId: number;
  customerName: string;
}

const Matters = () => {
  const [matters, setMatters] = useState<Matter[]>([]);

  // This would be replaced with an actual API call
  const mockMatters: Matter[] = [
    {
      id: 1,
      title: "Contract Review",
      description: "Review of service agreement",
      customerId: 1,
      customerName: "Acme Corporation",
    },
    {
      id: 2,
      title: "Property Dispute",
      description: "Boundary dispute with neighbor",
      customerId: 2,
      customerName: "Johnson & Associates",
    },
    {
      id: 3,
      title: "Estate Planning",
      description: "Will and trust creation",
      customerId: 3,
      customerName: "Smith Family Trust",
    },
  ];

  // Simulating data fetching on component mount
  useState(() => {
    setMatters(mockMatters);
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Matters</h1>
        <button className="btn btn-primary">Add Matter</button>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Customer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {matters.map((matter) => (
              <tr key={matter.id}>
                <td>{matter.id}</td>
                <td>{matter.title}</td>
                <td>{matter.description}</td>
                <td>{matter.customerName}</td>
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

export default Matters;
