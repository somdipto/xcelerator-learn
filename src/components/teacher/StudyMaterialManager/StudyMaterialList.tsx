import React, { useEffect, useState } from 'react';
import { StudyMaterial } from '../../../data/studyMaterial'; // Adjust path as needed
// import { Button } from '../../ui/button'; // Assuming you have a button component
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table'; // Assuming table components

interface StudyMaterialListProps {
  materials: StudyMaterial[];
  onEdit: (material: StudyMaterial) => void;
  onDelete: (materialId: string) => void;
  isLoading?: boolean; // Optional: if manager passes loading state
}

const StudyMaterialList: React.FC<StudyMaterialListProps> = ({ materials, onEdit, onDelete, isLoading }) => {
  // const [materials, setMaterials] = useState<StudyMaterial[]>(mockStudyMaterials); // Removed, materials come from props
  // const [loading, setLoading] = useState<boolean>(false); // Removed, loading state managed by parent
  // const [error, setError] = useState<string | null>(null); // Removed, error state managed by parent

  // TODO: Replace with actual API call
  // useEffect(() => {
  //   setLoading(true);
  //   fetch('/api/studymaterials') // Replace with your actual API endpoint
  //     .then(res => res.json())
  //     .then(data => {
  //       setMaterials(data);
  //       setLoading(false);
  //     })
  //     .catch(err => {
  //       setError('Failed to load study materials.');
  //       setLoading(false);
  //       console.error(err);
  //     });
  // }, []);

  if (isLoading) return <p>Loading materials...</p>;
  // if (error) return <p style={{ color: 'red' }}>{error}</p>; // Error display handled by parent

  return (
    <div>
      <h3>Study Materials</h3>
      {materials.length === 0 && !isLoading ? ( // Also check isLoading to avoid showing "No materials" during load
        <p>No study materials uploaded yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(material => (
              <tr key={material.id}>
                <td>{material.title}</td>
                <td>{material.type}</td>
                <td>
                  <button onClick={() => onEdit(material)}>Edit</button>
                  <button onClick={() => onDelete(material.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Example of how you might use ShadCN components if available & imported */}
      {/* <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.map(material => (
            <TableRow key={material.id}>
              <TableCell>{material.title}</TableCell>
              <TableCell>{material.type}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => onEdit(material)}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(material.id)} style={{ marginLeft: '8px' }}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table> */}
    </div>
  );
};

export default StudyMaterialList;
