<script lang="ts">
import Users from "@lucide/svelte/icons/users";
import Crown from "@lucide/svelte/icons/crown";
import UserPlus from "@lucide/svelte/icons/user-plus";
import UserMinus from "@lucide/svelte/icons/user-minus";
import LogOut from "@lucide/svelte/icons/log-out";
import ArrowLeft from "@lucide/svelte/icons/arrow-left";
import Mail from "@lucide/svelte/icons/mail";
import Calendar from "@lucide/svelte/icons/calendar";
import MoreVertical from "@lucide/svelte/icons/more-vertical";
import Search from "@lucide/svelte/icons/search";
import Trash2 from "@lucide/svelte/icons/trash-2";
import Settings from "@lucide/svelte/icons/settings";
import Edit from "@lucide/svelte/icons/edit";
import FileText from "@lucide/svelte/icons/file-text";

import { m } from "$lib/paraglide/messages";

import type { PageProps } from './$types';
import type { SubmitFunction } from '@sveltejs/kit';

import { onMount } from 'svelte';
import { toast } from "svelte-sonner";
import { goto } from "$app/navigation";
import { enhance } from '$app/forms';
import { invalidateAll } from '$app/navigation';

import * as Card from "$lib/components/ui/card";
import * as Form from "$lib/components/ui/form";
import * as Dialog from "$lib/components/ui/dialog";
import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
import * as AlertDialog from "$lib/components/ui/alert-dialog";
import { Label } from "$lib/components/ui/label";
import { Input } from "$lib/components/ui/input";
import { Button } from "$lib/components/ui/button";
import { Badge } from "$lib/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "$lib/components/ui/avatar";
import { Separator } from "$lib/components/ui/separator";
import { superForm } from "sveltekit-superforms";
import { zod4Client } from "sveltekit-superforms/adapters";
import { addMemberSchema, changeGroupNameSchema, type AddMemberSchema, type ChangeGroupNameSchema } from "./schema";
import type { User } from "$lib/entities/user";
import * as Select from "$lib/components/ui/select";
import type { UserDTO, UserGroupDTO } from "$lib/api/usergroupAPI/response/GetAllUserGroupsResponse";

let { data }: PageProps = $props();

// Dialog states
let isAddMemberDialogOpen = $state(false);
let isLeaveGroupDialogOpen = $state(false);
let isChangeNameDialogOpen = $state(false);
let isDeleteGroupDialogOpen = $state(false);
let memberToRemove: UserDTO | null = $state(null);
let searchQuery = $state('');

// Loading states
let removingMember = $state(false);
let leavingGroup = $state(false);
let deletingGroup = $state(false);
let togglingLeader = $state(false);

// Reactive group details that will be updated
let groupDetails = $state(structuredClone(data.group));
let current_user = $state(data.current_user);

// Add Member Form
const addMemberForm = superForm(data.add_member_form, {
  validators: zod4Client(addMemberSchema),
  resetForm: true,
  onUpdated: ({ form }) => {
    if (form.valid) {
      toast.success(m.member_added_successfully());
      
      const addedUser = data.allUsers.find(u => u.email === form.data.email);
      if (addedUser) {
        const newAssignment = {
          user: addedUser,
          is_leader: false,
          joined_at: new Date().toISOString()
        };
        
        groupDetails = {
          ...groupDetails,
          assignments: [...groupDetails.assignments, newAssignment],
          user_count: groupDetails.user_count + 1
        };
      }
      
      setTimeout(() => {
        isAddMemberDialogOpen = false;
      }, 100);
    } else if (form.errors._errors) {
      toast.error(form.errors._errors[0] || m.error_adding_member());
    }
  },
  onError: ({ result }) => {
    toast.error(m.error_adding_member());
  },
  onResult: ({ result }) => {
    if (result.type === 'success' || result.type === 'failure') {
      setTimeout(() => {
        isAddMemberDialogOpen = false;
      }, 100);
    }
  }
});

const {
  form: addMemberFormData, 
  enhance: enhanceAddMemberForm, 
  submitting: submittingAddMember,
  errors: addMemberErrors
} = addMemberForm;

// Change Group Name Form
const changeGroupNameForm = superForm(data.change_group_name_form, {
  validators: zod4Client(changeGroupNameSchema),
  resetForm: false,
  onUpdated: ({ form }) => {
    if (form.valid) {
      toast.success(m.group_name_changed_successfully());
      
      groupDetails = { 
        ...groupDetails, 
        name: form.data.name 
      };
      
      setTimeout(() => {
        isChangeNameDialogOpen = false;
      }, 100);
    } else if (form.errors._errors) {
      toast.error(form.errors._errors[0] || m.error_changing_group_name());
    }
  },
  onError: ({ result }) => {
    toast.error(m.error_changing_group_name());
  },
  onResult: ({ result }) => {
    if (result.type === 'success' || result.type === 'failure') {
      setTimeout(() => {
        isChangeNameDialogOpen = false;
      }, 100);
    }
  }
});

const {
  form: changeGroupNameFormData, 
  enhance: enhanceChangeGroupNameForm, 
  submitting: submittingChangeGroupName,
  errors: changeGroupNameErrors
} = changeGroupNameForm;

// Derived values
const isCurrentUserAdmin = $derived(current_user?.is_admin ?? false);
const isCurrentUserLeader = $derived(
  groupDetails.assignments.find(elem => elem.user.id === current_user?.id)?.is_leader ?? false
);

const filteredMembers = $derived(
  groupDetails.assignments.filter(member =>
    getFullName(member.user).toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )
);

const availableUsers = $derived(
  data.allUsers.filter(user => 
    !groupDetails.assignments.some(assignment => assignment.user.id === user.id)
  )
);

// Helper functions
function getFullName(user: UserDTO) {
  return user.first_name + " " + user.last_name;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('de-DE');
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function canSeeActionsMenu(){
  return isCurrentUserAdmin || isCurrentUserLeader;
}

function canActOnMember(member: UserDTO): boolean {
  if (!canSeeActionsMenu()) {
    return false;
  }
  
  const isTargetSelf = member.id === current_user?.id;
  
  if (isCurrentUserAdmin) {
    return true;
  }
  
  if (isCurrentUserLeader) {
    if (isTargetSelf) {
      return false;
    }
    
    return !member.is_admin;
  }
  
  return false;
}

// Enhanced form actions
const removeMemberAction: SubmitFunction = ({ formData }) => {
  removingMember = true;
  const memberId = formData.get('memberId') as string;
  
  return async ({ result }) => {
    removingMember = false;
    
    if (result.type === 'success') {
      toast.success('Member removed successfully');
      
      groupDetails = {
        ...groupDetails,
        assignments: groupDetails.assignments.filter(
          assignment => assignment.user.id !== memberId
        ),
        user_count: groupDetails.user_count - 1
      };
      
      memberToRemove = null;
    } else if (result.type === 'failure') {
      toast.error(result.data?.error || 'Failed to remove member');
      memberToRemove = null;
    }
  };
};

const leaveGroupAction: SubmitFunction = () => {
  leavingGroup = true;
  return async ({ result }) => {
    leavingGroup = false;
    
    if (result.type === 'redirect') {
      toast.success('Left group successfully');
      goto('/groups');
    } else if (result.type === 'failure') {
      toast.error(result.data?.error || 'Failed to leave group');
      isLeaveGroupDialogOpen = false;
    }
  };
};

const deleteGroupAction: SubmitFunction = () => {
  deletingGroup = true;
  return async ({ result }) => {
    deletingGroup = false;
    
    if (result.type === 'redirect') {
      toast.success('Group deleted successfully');
      goto('/groups');
    } else if (result.type === 'failure') {
      toast.error(result.data?.error || 'Failed to delete group');
      isDeleteGroupDialogOpen = false;
    }
  };
};

const toggleLeaderAction: SubmitFunction = ({ formData }) => {
  togglingLeader = true;
  const memberId = formData.get('memberId') as string;
  const makeLeader = formData.get('makeLeader') === 'true';
  
  return async ({ result }) => {
    togglingLeader = false;
    
    if (result.type === 'success') {
      toast.success(makeLeader ? 'Member promoted to leader' : 'Leader role revoked');
      
      const updatedAssignments = groupDetails.assignments.map(assignment => {
        if (assignment.user.id === memberId) {
          return {
            ...assignment,
            is_leader: makeLeader
          };
        }
        return assignment;
      });
      
      groupDetails = {
        ...groupDetails,
        assignments: updatedAssignments
      };
    } else if (result.type === 'failure') {
      toast.error(result.data?.error || 'Failed to change member role');
    }
  };
};

// Action functions for programmatic form submission
async function removeMember() {
  if (!memberToRemove) return;
  
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = '?/removeMember';
  
  const memberIdInput = document.createElement('input');
  memberIdInput.type = 'hidden';
  memberIdInput.name = 'memberId';
  memberIdInput.value = memberToRemove.id;
  form.appendChild(memberIdInput);
  
  document.body.appendChild(form);
  
  const enhancedSubmit = enhance(form, removeMemberAction);
  form.requestSubmit();
  
  document.body.removeChild(form);
}

async function leaveGroup() {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = '?/leaveGroup';
  
  document.body.appendChild(form);
  
  const enhancedSubmit = enhance(form, leaveGroupAction);
  form.requestSubmit();
  
  document.body.removeChild(form);
}

async function changeRole(member: UserDTO, makeLeader: boolean) {
  togglingLeader = true; // Loading state sofort setzen
  
  try {
    const formData = new FormData();
    formData.append('memberId', member.id);
    formData.append('makeLeader', String(makeLeader));

    const response = await fetch('?/toggleLeader', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (response.ok) {
      toast.success(makeLeader ? 'Member promoted to leader' : 'Leader role revoked');
      
      // State sofort aktualisieren
      const updatedAssignments = groupDetails.assignments.map(assignment => {
        if (assignment.user.id === member.id) {
          return {
            ...assignment,
            is_leader: makeLeader
          };
        }
        return assignment;
      });
      
      groupDetails = {
        ...groupDetails,
        assignments: updatedAssignments
      };
    } else {
      toast.error(result?.error || 'Failed to change member role');
    }
  } catch (error) {
    toast.error('Failed to change member role');
  } finally {
    togglingLeader = false;
  }
}

async function deleteGroup() {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = '?/deleteGroup';
  
  document.body.appendChild(form);
  
  const enhancedSubmit = enhance(form, deleteGroupAction);
  form.requestSubmit();
  
  document.body.removeChild(form);
}

function openChangeNameDialog() {
  $changeGroupNameFormData.name = groupDetails.name;
  isChangeNameDialogOpen = true;
}

function openAddMemberDialog() {
  $addMemberFormData.email = '';
  isAddMemberDialogOpen = true;
}

function forceCloseAddMemberDialog() {
  isAddMemberDialogOpen = false;
}

function forceCloseChangeNameDialog() {
  isChangeNameDialogOpen = false;
}

onMount(() => {
  if (data.success) {
    toast.success(m.group_loaded_successfully());
  } else {
    toast.error(m.error_loading_group());
  }
});

$effect(() => {
  groupDetails = structuredClone(data.group);
});
</script>

<div class="sticky top-[54px] overflow-hidden max-h-[calc(100vh-54px)] h-screen p-3 sm:p-6">
    <div class="mx-auto max-w-6xl h-full flex flex-col">
    <div class="mb-6 sm:mb-8">
      <div class="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="sm" onclick={() => goto('/groups')} class="gap-2">
          <ArrowLeft class="size-4" />
          <span class="hidden sm:inline">{m.back_to_groups()}</span>
        </Button>
      </div>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
          <div class="bg-primary text-primary-foreground flex size-12 sm:size-16 items-center justify-center rounded-xl">
            <Users class="size-6 sm:size-8" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold break-words">{groupDetails.name}</h1>
            <div class="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
              <span>{groupDetails.user_count} {m.members()}</span>
              <Separator orientation="vertical" class="h-4 hidden sm:block" />
              <span>{m.created_on()} {formatDate(groupDetails.created_at)}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Button href="/documents?group={groupDetails.name}"
                  class="gap-2 flex-1 sm:flex-initial"
                  size="sm">
            <FileText class="size-4" />
            {m.view_group_documents()}
          </Button>
          {#if isCurrentUserAdmin || isCurrentUserLeader}
            <Button 
              onclick={openAddMemberDialog}
              class="gap-2 flex-1 sm:flex-initial" 
              size="sm"
              disabled={$submittingAddMember}
            >
              <UserPlus class="size-4" />
              <span class="hidden sm:inline">{m.add_member()}</span>
              <span class="sm:hidden">Add</span>
            </Button>
          {/if}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="ghost" size="icon">
                <MoreVertical class="size-4" />
                <span class="sr-only">{m.more_actions()}</span>
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              {#if isCurrentUserAdmin || isCurrentUserLeader}
                <DropdownMenu.Item
                  class="gap-2"
                  onclick={openChangeNameDialog}
                  disabled={$submittingChangeGroupName}
                >
                  <Edit class="size-4" />
                  {m.edit_group_name()}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  class="gap-2 text-destructive focus:text-destructive"
                  onclick={() => isDeleteGroupDialogOpen = true}
                  disabled={deletingGroup}
                >
                  <Trash2 class="size-4" />
                  {deletingGroup ? 'Deleting...' : m.delete_group()}
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
              {/if}
              <DropdownMenu.Item
                class="gap-2 text-destructive focus:text-destructive"
                onclick={() => isLeaveGroupDialogOpen = true}
                disabled={leavingGroup}
              >
                <LogOut class="size-4" />
                {leavingGroup ? 'Leaving...' : m.leave_group()}
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>
    </div>
    
    <Card.Root class="flex-1 flex flex-col min-h-0">
      <Card.Header class="flex-shrink-0">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Card.Title>{m.members_title(   )}</Card.Title>
            <Card.Description>{m.all_members_in_group({ count: groupDetails.user_count })}</Card.Description>
          </div>
          <div class="flex items-center gap-2">
            <div class="relative w-full sm:w-64">
              <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={m.search_members()}
                bind:value={searchQuery}
                class="pl-9 w-full"
              />
            </div>
          </div>
        </div>
      </Card.Header>
      <Card.Content class="p-0 flex-1 overflow-hidden">
        <div class="divide-y h-full overflow-y-auto">
          {#each filteredMembers as member (member.user.id)}
            <div class="p-4 sm:p-6">
              <div class="flex items-start sm:items-center justify-between gap-4">
                <div class="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <Avatar class="size-10 sm:size-12 flex-shrink-0">
                    <AvatarImage alt={getFullName(member.user)} />
                    <AvatarFallback class="bg-primary/10 text-primary text-sm">
                      {getInitials(member.user.first_name + " " + member.user.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <h3 class="font-semibold truncate">{getFullName(member.user)}</h3>
                      <div class="flex flex-wrap gap-1">
                        {#if member.user.is_admin}
                          <Badge variant="secondary" class="gap-1 text-xs">
                            <Crown class="size-3" />
                            Admin
                          </Badge>
                        {/if}
                        {#if member.is_leader}
                          <Badge variant="default" class="gap-1 text-xs">
                            <Crown class="size-3" />
                            {m.leader()}
                          </Badge>
                        {/if}
                        {#if member.user.id === current_user?.id}
                          <Badge variant="outline" class="text-xs">{m.you()}</Badge>
                        {/if}
                      </div>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Mail class="size-3 flex-shrink-0" />
                      <span class="truncate">{member.user.email}</span>
                    </div>
                    <div class="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Calendar class="size-3 flex-shrink-0" />
                      {m.joined_on()} {formatDate(member.joined_at)}
                    </div>
                  </div>
                </div>
                {#if canSeeActionsMenu() && canActOnMember(member.user)}
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        class="flex-shrink-0" 
                        disabled={togglingLeader || removingMember}
                      >
                        <MoreVertical class="size-4" />
                        <span class="sr-only">{m.actions_for({ memberName: getFullName(member.user) })}</span>
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end">
                      {#if member.is_leader}
                        <DropdownMenu.Item
                          class="gap-2"
                          onclick={() => changeRole(member.user, false)}
                          disabled={togglingLeader}
                        >
                          <UserMinus class="size-4" />
                          {togglingLeader ? 'Changing...' : m.revoke_leader_role()}
                        </DropdownMenu.Item>
                      {:else}
                        <DropdownMenu.Item
                          class="gap-2"
                          onclick={() => changeRole(member.user, true)}
                          disabled={togglingLeader}
                        >
                          <Crown class="size-4" />
                          {togglingLeader ? 'Changing...' : m.make_leader()}
                        </DropdownMenu.Item>
                      {/if}
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item
                        class="gap-2 text-destructive focus:text-destructive"
                        onclick={() => memberToRemove = member.user}
                        disabled={removingMember}
                      >
                        <Trash2 class="size-4" />
                        {removingMember ? 'Removing...' : m.remove_from_group()}
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>

    <!-- Add Member Dialog -->
    <Dialog.Root bind:open={isAddMemberDialogOpen}>
      <Dialog.Content class="sm:max-w-md max-w-[95vw]">
        <Dialog.Header>
          <Dialog.Title>{m.add_member()}</Dialog.Title>
          <Dialog.Description class="text-sm">
            {m.add_new_member_to_group({ groupName: groupDetails.name })}
          </Dialog.Description>
        </Dialog.Header>
        <form method="POST" action="?/addMember" use:enhanceAddMemberForm>
          <div class="grid gap-4 py-4">
            <div class="space-y-2">
              <Label for="email">{m.field_email()}</Label>
              <select 
                id="email" 
                name="email" 
                bind:value={$addMemberFormData.email}
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">{m.select_user_email()}</option>
                {#each availableUsers as user (user.id)}
                  <option value={user.email}>{getFullName(user)} ({user.email})</option>
                {/each}
              </select>
              {#if $addMemberErrors.email}
                <p class="text-sm text-destructive">{$addMemberErrors.email}</p>
              {/if}
            </div>
          </div>
          <Dialog.Footer class="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onclick={forceCloseAddMemberDialog}
              disabled={$submittingAddMember}
              class="w-full sm:w-auto"
            >
              {m.abort()}
            </Button>
            <Button
              type="submit"
              class="gap-2 w-full sm:w-auto"
              disabled={$submittingAddMember}
            >
              <UserPlus class="size-4" />
              {$submittingAddMember ? m.adding_member() : m.add_member()}
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog.Root>

    <!-- Change Group Name Dialog -->
    <Dialog.Root bind:open={isChangeNameDialogOpen}>
      <Dialog.Content class="sm:max-w-md max-w-[95vw]">
        <Dialog.Header>
          <Dialog.Title>{m.change_group_name()}</Dialog.Title>
          <Dialog.Description class="text-sm">
            {m.enter_new_group_name()}
          </Dialog.Description>
        </Dialog.Header>
        <form method="POST" action="?/changeGroupName" use:enhanceChangeGroupNameForm>
          <div class="grid gap-4 py-4">
            <div class="space-y-2">
              <Label for="name">{m.group_name()}</Label>
              <Input
                id="name"
                name="name"
                bind:value={$changeGroupNameFormData.name}
                placeholder={m.example_group_name_developer_team()}
              />
              {#if $changeGroupNameErrors.name}
                <p class="text-sm text-destructive">{$changeGroupNameErrors.name}</p>
              {/if}
            </div>
          </div>
          <Dialog.Footer class="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onclick={forceCloseChangeNameDialog}
              disabled={$submittingChangeGroupName}
              class="w-full sm:w-auto"
            >
              {m.abort()}
            </Button>
            <Button
              type="submit"
              class="gap-2 w-full sm:w-auto"
              disabled={$submittingChangeGroupName}
            >
              <Edit class="size-4" />
              {$submittingChangeGroupName ? m.saving() : m.save_changes()}
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog.Root>

    <!-- Leave Group Dialog -->
    <AlertDialog.Root bind:open={isLeaveGroupDialogOpen}>
      <AlertDialog.Content class="max-w-[95vw] sm:max-w-md">
        <AlertDialog.Header>
          <AlertDialog.Title>{m.leave_group_title()}</AlertDialog.Title>
          <AlertDialog.Description class="text-sm">
            {m.leave_group_confirmation({ groupName: groupDetails.name })}
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer class="flex flex-col sm:flex-row gap-2">
          <AlertDialog.Cancel disabled={leavingGroup} class="w-full sm:w-auto">{m.abort()}</AlertDialog.Cancel>
          <AlertDialog.Action 
            onclick={leaveGroup} 
            class="bg-destructive hover:bg-destructive/90 w-full sm:w-auto" 
            disabled={leavingGroup}
          >
            {leavingGroup ? 'Leaving...' : m.leave_group()}
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Root>

    <!-- Remove Member Dialog -->
    <AlertDialog.Root open={memberToRemove !== null} onOpenChange={(open) => !open && (memberToRemove = null)}>
      <AlertDialog.Content class="max-w-[95vw] sm:max-w-md">
        <AlertDialog.Header>
          <AlertDialog.Title>{m.remove_member_title()}</AlertDialog.Title>
          <AlertDialog.Description class="text-sm">
            {memberToRemove && m.remove_member_confirmation({ memberName: getFullName(memberToRemove), groupName: groupDetails.name })}
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer class="flex flex-col sm:flex-row gap-2">
          <AlertDialog.Cancel disabled={removingMember} class="w-full sm:w-auto">{m.abort()}</AlertDialog.Cancel>
          <AlertDialog.Action
            onclick={removeMember}
            class="bg-destructive hover:bg-destructive/90 w-full sm:w-auto"
            disabled={removingMember}
          >
            {removingMember ? 'Removing...' : m.remove_member_title()}
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Root>

    <!-- Delete Group Dialog -->
    <AlertDialog.Root bind:open={isDeleteGroupDialogOpen}>
      <AlertDialog.Content class="max-w-[95vw] sm:max-w-md">
        <AlertDialog.Header>
          <AlertDialog.Title>{m.delete_group_title()}</AlertDialog.Title>
          <AlertDialog.Description class="text-sm">
            {m.delete_group_confirmation({ groupName: groupDetails.name })}
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer class="flex flex-col sm:flex-row gap-2">
          <AlertDialog.Cancel disabled={deletingGroup} class="w-full sm:w-auto">{m.abort()}</AlertDialog.Cancel>
          <AlertDialog.Action 
            onclick={deleteGroup} 
            class="bg-destructive hover:bg-destructive/90 w-full sm:w-auto" 
            disabled={deletingGroup}
          >
            {deletingGroup ? 'Deleting...' : m.delete_group()}
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Root>
  </div>
</div>