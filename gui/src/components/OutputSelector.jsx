import React from 'react';
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import { useSettings } from '../providers/Settings';

export default function OutputSelector(props) {
  const {
    settings: { output },
    sonosGroups,
    setOutput,
  } = useSettings();

  return (
    <UncontrolledDropdown {...props}>
      <DropdownToggle nav caret>
        <OutputTypeLabel {...output} sonosGroups={sonosGroups} />
      </DropdownToggle>
      <DropdownMenu right>
        <DropdownItem key="local" onClick={() => setOutput({ variables: { type: 'local' } })}>
          Local speakers
        </DropdownItem>
        {sonosGroups
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(g => (
            <DropdownItem key={`sonos-${g.id}`} onClick={() => setOutput({ variables: { type: 'sonos', groupId: g.id } })}>
              Sonos: {g.name}
            </DropdownItem>
          ))}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
}

function OutputTypeLabel({ type, groupId, sonosGroups }) {
  if (type === 'sonos') {
    const group = sonosGroups.find(g => g.id === groupId);
    return `Sonos: ${group ? group.name : '???'}`;
  }

  return 'Local speakers';
}
