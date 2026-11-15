import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getTripBySlug } from '@/lib/trips';

const IMPORTANCE_VALUES = ['high', 'normal', 'low'];
const TYPE_VALUES = ['master', 'personal'];

export async function GET(request: Request) {
  const trip = getTripBySlug(new URL(request.url).searchParams.get('trip') ?? '');
  if (!trip) return NextResponse.json({ error: 'Invalid trip' }, { status: 400 });

  const { data, error } = await supabase
    .from('preparation_items')
    .select('*')
    .eq('trip_id', trip.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, type, assignees, importance } = body;

    const trip = getTripBySlug(typeof body?.trip === 'string' ? body.trip : '');
    if (!trip) return NextResponse.json({ error: 'Invalid trip' }, { status: 400 });

    // 요청 본문은 신뢰하지 않는다. 필수값과 허용 값, 배열 형태를 확인한 뒤에만 저장한다.
    const normalizedTitle = typeof title === 'string' ? title.trim() : '';
    const normalizedAssignees = assignees === undefined || assignees === null ? [] : assignees;
    if (
      !normalizedTitle || normalizedTitle.length > 100
      || !TYPE_VALUES.includes(type)
      || !IMPORTANCE_VALUES.includes(importance)
      || !Array.isArray(normalizedAssignees)
      || normalizedAssignees.length > 10
      || normalizedAssignees.some((user: unknown) => typeof user !== 'string' || !user || user.length > 20)
    ) {
      return NextResponse.json({ error: 'Invalid checklist item' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('preparation_items')
      .insert([
        {
          trip_id: trip.id,
          title: normalizedTitle,
          type,
          assignees: normalizedAssignees,
          importance,
          completed_by: []
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, title, importance, assignees, completed_by, completed_by_user, completed } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    if (completed_by_user !== undefined && typeof completed_by_user !== 'string') {
      return NextResponse.json({ error: 'completed_by_user must be a string' }, { status: 400 });
    }

    if (completed !== undefined && typeof completed !== 'boolean') {
      return NextResponse.json({ error: 'completed must be a boolean' }, { status: 400 });
    }

    if (completed_by !== undefined && (!Array.isArray(completed_by) || completed_by.some((user) => typeof user !== 'string'))) {
      return NextResponse.json({ error: 'completed_by must be an array of strings' }, { status: 400 });
    }

    if (completed_by_user !== undefined && completed === undefined) {
      return NextResponse.json({ error: 'completed is required with completed_by_user' }, { status: 400 });
    }

    // Per-user completion updates are preferred by the client. The operation
    // is merged on the server so callers never need to replace another user's
    // completion state with a stale full array.
    if (completed_by_user !== undefined) {
      const { data: current, error: readError } = await supabase
        .from('preparation_items')
        .select('completed_by')
        .eq('id', id)
        .maybeSingle();

      if (readError) throw readError;
      if (!current) return NextResponse.json({ error: 'Checklist item not found' }, { status: 404 });

      const currentCompletedBy = Array.isArray(current.completed_by) ? current.completed_by : [];
      const nextCompletedBy = completed
        ? Array.from(new Set([...currentCompletedBy, completed_by_user]))
        : currentCompletedBy.filter((user) => user !== completed_by_user);

      const { data, error } = await supabase
        .from('preparation_items')
        .update({ completed_by: nextCompletedBy })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) return NextResponse.json({ error: 'Checklist item not found' }, { status: 404 });
      return NextResponse.json({ data });
    }

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (importance !== undefined) updates.importance = importance;
    if (assignees !== undefined) updates.assignees = assignees;
    if (completed_by !== undefined) updates.completed_by = completed_by;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('preparation_items')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Checklist item not found' }, { status: 404 });

    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('preparation_items')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
