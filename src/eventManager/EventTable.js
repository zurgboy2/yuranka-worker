import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@/components/ui/table';

const EventTable = ({ events }) => {
  return (
    <TableContainer component={Paper} className="bg-gray-800 text-white">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell className="text-white font-bold">Name</TableCell>
            <TableCell className="text-white font-bold">Start Date</TableCell>
            <TableCell className="text-white font-bold">End Date</TableCell>
            <TableCell className="text-white font-bold">Price</TableCell>
            <TableCell className="text-white font-bold">Type</TableCell>
            <TableCell className="text-white font-bold">Attendees</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event['Event ID']}>
              <TableCell className="text-white">{event.Name}</TableCell>
              <TableCell className="text-white">{new Date(event['Start Date']).toLocaleString()}</TableCell>
              <TableCell className="text-white">{new Date(event['End Date']).toLocaleString()}</TableCell>
              <TableCell className="text-white">{`€${event.Price}`}</TableCell>
              <TableCell className="text-white">{event['Type of event']}</TableCell>
              <TableCell className="text-white">{event.Attendees ? event.Attendees.length : 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EventTable;