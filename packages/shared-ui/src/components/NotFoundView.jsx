import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from './Card.jsx';
import { Button } from './Button.jsx';

/**
 * Reusable Not Found View for all portals
 */
export function NotFoundView({ portalName = 'Portal', homePath = '/' }) {
  return (
    <div className="max-w-md mx-auto py-12">
      <Card title="Page Not Found" subtitle="Error 404">
        <p className="text-sm text-slate-600 mb-4">
          The requested page does not exist within the {portalName}.
        </p>
        <Link to={homePath}>
          <Button variant="primary" size="sm">Return to Overview</Button>
        </Link>
      </Card>
    </div>
  );
}
