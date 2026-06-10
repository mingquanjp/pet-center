const { Project } = require('ts-morph');

const ownerFns = [
  'listAvailableServices',
  'getBookingOptions',
  'getAvailability',
  'listBookedTickets',
  'listTicketHistory',
  'getBookedTicket',
  'cancelBookedTicket',
  'createTicket'
];

const staffFns = [
  'listStaffAvailableServices',
  'getStaffCounterAvailability',
  'getStaffCounterOptions',
  'createStaffCounterTicket',
  'listStaffTickets',
  'acceptStaffTicket',
  'completeStaffTicket',
  'startStaffTicket',
  'cancelStaffTicket'
];

async function main() {
  const project = new Project({
    tsConfigFilePath: 'd:/Hoc_tap/pet-center/backend/tsconfig.json',
  });

  const serviceFile = project.getSourceFile('src/modules/grooming/grooming.service.ts');
  const ownerFile = project.createSourceFile('src/modules/grooming/owner-grooming.service.ts', serviceFile.getFullText(), { overwrite: true });
  const staffFile = project.createSourceFile('src/modules/grooming/staff-grooming.service.ts', serviceFile.getFullText(), { overwrite: true });

  for (const fnName of staffFns) {
    const fn = ownerFile.getFunction(fnName);
    if (fn) fn.remove();
  }

  for (const fnName of ownerFns) {
    const fn = staffFile.getFunction(fnName);
    if (fn) fn.remove();
  }

  serviceFile.replaceWithText(`export * from './owner-grooming.service.js';\nexport * from './staff-grooming.service.js';\n`);

  await project.save();
  console.log('Services split successfully using ts-morph');
}

main().catch(console.error);
